//! Local HTTP session in front of the vendored Percolator engine.
//!
//! Binds to loopback only. Example atoms never leave this process.

use std::io::{Read, Write};
use std::net::{TcpListener, TcpStream};
use std::sync::{Mutex, OnceLock};

use fork_session::{EngineSession, PublicState, SideReq, Who, ENGINE_REVISION, PROGRAM_REVISION};
use serde::Deserialize;
use serde_json::json;

static SESSION: OnceLock<Mutex<EngineSession>> = OnceLock::new();

fn session() -> &'static Mutex<EngineSession> {
    SESSION.get_or_init(|| Mutex::new(EngineSession::new().expect("engine session opens")))
}

fn main() {
    let args: Vec<String> = std::env::args().skip(1).collect();
    if args.first().map(String::as_str) == Some("lifecycle") {
        let report = fork_session::run_documented_lifecycle();
        println!("{}", serde_json::to_string_pretty(&report).expect("report serializes"));
        let failed = report.steps.iter().any(|step| !step.ok);
        std::process::exit(if failed { 1 } else { 0 });
    }

    let port: u16 = std::env::var("FORK_ENGINE_PORT")
        .ok()
        .and_then(|value| value.parse().ok())
        .unwrap_or(43124);
    let listener = TcpListener::bind(("127.0.0.1", port)).expect("bind loopback engine port");
    eprintln!(
        "Percolator Fork local engine on http://127.0.0.1:{port} (engine {ENGINE_REVISION}, program pin {PROGRAM_REVISION})"
    );
    for conn in listener.incoming() {
        match conn {
            Ok(stream) => {
                if let Err(err) = handle(stream) {
                    eprintln!("connection error: {err}");
                }
            }
            Err(err) => eprintln!("accept error: {err}"),
        }
    }
}

fn handle(mut stream: TcpStream) -> std::io::Result<()> {
    let mut buf = vec![0u8; 64 * 1024];
    let n = stream.read(&mut buf)?;
    let text = String::from_utf8_lossy(&buf[..n]);
    let mut lines = text.split("\r\n");
    let request = lines.next().unwrap_or("");
    let mut parts = request.split_whitespace();
    let method = parts.next().unwrap_or("");
    let path = parts.next().unwrap_or("/");
    let body = text
        .split("\r\n\r\n")
        .nth(1)
        .unwrap_or("")
        .trim_matches('\0')
        .to_string();

    let result = dispatch(method, path, &body);
    let (status, payload) = match result {
        Ok(value) => (200, value),
        Err(err) => {
            let state = session()
                .lock()
                .ok()
                .map(|guard| guard.public_state());
            (
                400,
                json!({
                    "error": err,
                    "state": state,
                }),
            )
        }
    };
    let bytes = serde_json::to_vec(&payload).unwrap_or_else(|_| b"{}".to_vec());
    let reason = if status == 200 { "OK" } else { "Bad Request" };
    let response = format!(
        "HTTP/1.1 {status} {reason}\r\nContent-Type: application/json\r\nContent-Length: {}\r\nAccess-Control-Allow-Origin: *\r\nConnection: close\r\n\r\n",
        bytes.len()
    );
    stream.write_all(response.as_bytes())?;
    stream.write_all(&bytes)?;
    Ok(())
}

fn dispatch(method: &str, path: &str, body: &str) -> Result<serde_json::Value, String> {
    if method == "GET" && (path == "/health" || path == "/v1/state") {
        let guard = session().lock().map_err(|_| "session lock poisoned".to_string())?;
        return Ok(serde_json::to_value(guard.public_state()).map_err(|err| err.to_string())?);
    }
    if method != "POST" {
        return Err(format!("unsupported request {method} {path}"));
    }
    let mut guard = session().lock().map_err(|_| "session lock poisoned".to_string())?;
    let state: PublicState = match path {
        "/v1/reset" => {
            *guard = EngineSession::new()?;
            guard.public_state()
        }
        "/v1/deposit" => {
            let req: AmountReq = parse(body)?;
            guard.deposit(Who::parse(&req.who)?, parse_u128(&req.amount)?)?
        }
        "/v1/withdraw" => {
            let req: AmountReq = parse(body)?;
            guard.withdraw(Who::parse(&req.who)?, parse_u128(&req.amount)?)?
        }
        "/v1/open" => {
            let req: OpenReq = parse(body)?;
            guard.open(SideReq::parse(&req.side)?, parse_u128(&req.lots)?)?
        }
        "/v1/close" => guard.close()?,
        "/v1/crank" => {
            let req: CrankReq = parse(body)?;
            guard.crank(parse_u64(&req.price)?, parse_i128(&req.funding_rate_e9)?)?
        }
        "/v1/refresh" => guard.refresh()?,
        "/v1/liquidate" => {
            let req: WhoReq = parse(body)?;
            guard.liquidate(Who::parse(&req.who)?)?.0
        }
        "/v1/examples/liquidation-setup" => guard.prepare_liquidation_example()?,
        _ => return Err(format!("unknown path {path}")),
    };
    serde_json::to_value(state).map_err(|err| err.to_string())
}

fn parse<T: for<'de> Deserialize<'de>>(body: &str) -> Result<T, String> {
    serde_json::from_str(body).map_err(|err| format!("invalid json: {err}"))
}

fn parse_u128(value: &str) -> Result<u128, String> {
    value
        .trim()
        .parse()
        .map_err(|_| format!("expected an integer atom amount, got {value}"))
}

fn parse_u64(value: &str) -> Result<u64, String> {
    value
        .trim()
        .parse()
        .map_err(|_| format!("expected an integer price, got {value}"))
}

fn parse_i128(value: &str) -> Result<i128, String> {
    value
        .trim()
        .parse()
        .map_err(|_| format!("expected an integer funding rate, got {value}"))
}

#[derive(Deserialize)]
struct AmountReq {
    who: String,
    amount: String,
}

#[derive(Deserialize)]
struct OpenReq {
    side: String,
    lots: String,
}

#[derive(Deserialize)]
struct CrankReq {
    price: String,
    funding_rate_e9: String,
}

#[derive(Deserialize)]
struct WhoReq {
    who: String,
}

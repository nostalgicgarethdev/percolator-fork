use percolator_prog::ix::{CrankObservationHint, Instruction};
use percolator_prog::oracle_v16::{oracle_confidence_is_too_wide, oracle_publish_time_is_fresh};
use percolator_prog::policy_v16::premium_funding_rate_e9;

fn roundtrip(ix: Instruction) {
    let bytes = ix.encode();
    assert!(
        !bytes.is_empty(),
        "instruction codec produced an empty payload"
    );
    let decoded = Instruction::decode(&bytes).expect("instruction bytes must decode");
    assert_eq!(decoded, ix);
}

#[test]
fn custody_trade_crank_and_admin_instructions_roundtrip() {
    roundtrip(Instruction::InitPortfolio);
    roundtrip(Instruction::Deposit {
        portfolio_id: 7,
        expected_sequence: 3,
        amount: 1_500_000,
    });
    roundtrip(Instruction::Withdraw {
        portfolio_id: 7,
        expected_sequence: 4,
        amount: 250_000,
    });
    roundtrip(Instruction::TradeNoCpi {
        account_a_portfolio_id: 7,
        account_a_position_epoch: 1,
        account_b_portfolio_id: 8,
        account_b_position_epoch: 1,
        asset_index: 0,
        market_id: 11,
        size_q: -2_000_000,
        exec_price: 1_000_000,
        fee_bps: 0,
        backing_fee_cap_bps: 0,
    });
    roundtrip(Instruction::PermissionlessCrank {
        now_slot: 42,
        observations: vec![CrankObservationHint {
            asset_index: 0,
            oracle_accounts: 1,
        }],
    });
    roundtrip(Instruction::UpdateAuthority {
        authority_epoch: 2,
        new_pubkey: [9u8; 32],
    });
    roundtrip(Instruction::ResolveStalePermissionless { now_slot: 90 });
    roundtrip(Instruction::CloseResolved {
        fee_rate_per_slot: 0,
    });
}

#[test]
fn truncated_instruction_bytes_do_not_decode() {
    let bytes = Instruction::Deposit {
        portfolio_id: 1,
        expected_sequence: 1,
        amount: 1,
    }
    .encode();
    assert!(Instruction::decode(&bytes[..4]).is_err());
}

#[test]
fn oracle_age_and_confidence_rules_reject_stale_or_wide_prints() {
    assert!(oracle_publish_time_is_fresh(1_000, 1_030, 60));
    assert!(!oracle_publish_time_is_fresh(1_000, 1_061, 60));
    assert!(
        !oracle_publish_time_is_fresh(1_100, 1_000, 60),
        "a publish time in the future is not fresh"
    );
    assert!(!oracle_confidence_is_too_wide(50, 10_000, 100));
    assert!(oracle_confidence_is_too_wide(200, 10_000, 100));
}

#[test]
fn premium_funding_is_clamped_and_signed() {
    assert_eq!(premium_funding_rate_e9(150, 100, 1_000), Some(1_000));
    assert_eq!(premium_funding_rate_e9(100, 150, 1_000), Some(-1_000));
    assert_eq!(premium_funding_rate_e9(100, 100, 1_000), Some(0));
    assert_eq!(premium_funding_rate_e9(150, 100, 0), Some(0));
}

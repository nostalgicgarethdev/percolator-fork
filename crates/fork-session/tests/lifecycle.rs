use fork_session::run_documented_lifecycle;

#[test]
fn documented_lifecycle_passes_engine_gates() {
    let report = run_documented_lifecycle();
    for step in &report.steps {
        assert!(
            step.ok,
            "{} failed: {}",
            step.name, step.detail
        );
    }
    assert!(
        !report.final_state.program_deployed,
        "local lifecycle must not claim a deployed program"
    );
    assert_eq!(report.final_state.oracle, "none");
    assert_eq!(report.final_state.price_source, "example-mark");
}

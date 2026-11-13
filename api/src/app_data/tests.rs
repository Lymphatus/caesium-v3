use super::*;

fn status() -> Arc<CompressionStatus> {
    Arc::default()
}

#[test]
fn begin_claims_the_compressing_state() {
    let status = status();

    let _guard = status.begin().expect("free");

    assert!(status.is_compressing.load(AtomicOrdering::SeqCst));
}

#[test]
fn the_guard_clears_the_flag_when_it_drops() {
    let status = status();

    drop(status.begin().expect("free"));

    assert!(!status.is_compressing.load(AtomicOrdering::SeqCst));
}

#[test]
fn begin_refuses_while_another_guard_is_alive() {
    let status = status();
    let _guard = status.begin().expect("free");

    assert!(status.begin().is_none());
}

#[test]
fn begin_succeeds_again_after_the_guard_dropped() {
    let status = status();
    drop(status.begin().expect("free"));

    assert!(status.begin().is_some());
}

// A cancelled or paused run must not leak its flags into the next one.
#[test]
fn begin_resets_cancelled_and_paused() {
    let status = status();
    status
        .is_compression_cancelled
        .store(true, AtomicOrdering::SeqCst);
    status
        .is_compression_paused
        .store(true, AtomicOrdering::SeqCst);

    let _guard = status.begin().expect("free");

    assert!(!status.is_compression_cancelled.load(AtomicOrdering::SeqCst));
    assert!(!status.is_compression_paused.load(AtomicOrdering::SeqCst));
}

// The flag is cleared while unwinding, so a panicking run does not wedge the app.
#[test]
fn the_flag_is_cleared_when_the_holder_panics() {
    let status = status();

    let panicked = std::panic::catch_unwind({
        let status = Arc::clone(&status);
        move || {
            let _guard = status.begin().expect("free");
            panic!("boom");
        }
    });

    assert!(panicked.is_err());
    assert!(!status.is_compressing.load(AtomicOrdering::SeqCst));
}

// Only one of many concurrent callers may claim the state.
#[test]
fn only_one_concurrent_caller_claims_the_state() {
    let status = status();
    let claimed = Arc::new(std::sync::atomic::AtomicUsize::new(0));

    // The barrier makes every attempt happen before any guard is released, so
    // the count cannot depend on thread timing.
    let barrier = Arc::new(std::sync::Barrier::new(8));
    let threads: Vec<_> = (0..8)
        .map(|_| {
            let status = Arc::clone(&status);
            let claimed = Arc::clone(&claimed);
            let barrier = Arc::clone(&barrier);
            std::thread::spawn(move || {
                let guard = status.begin();
                if guard.is_some() {
                    claimed.fetch_add(1, AtomicOrdering::SeqCst);
                }
                barrier.wait();
                drop(guard);
            })
        })
        .collect();
    for thread in threads {
        thread.join().expect("joined");
    }

    assert_eq!(claimed.load(AtomicOrdering::SeqCst), 1);
    assert!(!status.is_compressing.load(AtomicOrdering::SeqCst));
}

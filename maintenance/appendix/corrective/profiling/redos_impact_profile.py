"""Quantifies the availability impact of CM-01 (unescaped user input in
MongoDB $regex, api/controllers/tour.controller.js#searchTours).

MongoDB's $regex operator is compiled with PCRE, which -- like both Python's
`re` and JavaScript's RegExp -- uses a backtracking matching engine. A search
term containing the classic nested-quantifier shape (a+)+ is therefore
exploitable as a Regular-Expression-Denial-of-Service (ReDoS, CWE-1333) vector
in all three engines. We use Python + cProfile + SnakeViz here purely as the
*measurement instrument* (this repo has no Python runtime component) because
it is the profiling toolchain available in this environment and taught in
class; the finding it produces (super-linear blow-up for crafted input) is
engine-agnostic and applies directly to the Node/Mongo code path being fixed.

Safety: catastrophic backtracking is O(2^n). This script imposes a wall-clock
budget and stops growing `n` once a single measurement crosses PER_STEP_CAP_S,
instead of hard-coding a length that might hang the machine.

Run:
    python maintenance/appendix/corrective/profiling/redos_impact_profile.py

Then inspect interactively:
    snakeviz maintenance/appendix/corrective/profiling/redos_profile.prof
"""
import cProfile
import pstats
import re
import time
from pathlib import Path

HERE = Path(__file__).parent

# Mirrors: new RegExp(term, "i") built from raw, un-escaped user input,
# matched against a plausible field value (a tour description).
VULNERABLE_PATTERN = r"(a+)+$"
SAFE_PATTERN = re.escape("(a+)+$")  # what escapeRegex() now produces server-side

PER_STEP_CAP_S = 1.5  # stop growing n once a single match takes longer than this
START_N = 10


def time_match(pattern, subject):
    start = time.perf_counter()
    re.match(pattern, subject)
    return time.perf_counter() - start


def vulnerable_scenario():
    """Simulates repeated searchTours() calls with a crafted `term` against a
    non-matching description field ('a' * n + '!') -- the canonical ReDoS
    trigger shape for (x+)+ patterns. Grows n until a single call is slow
    enough to prove the point, then stops (bounded wall-clock budget)."""
    results = []
    n = START_N
    while True:
        subject = "a" * n + "!"
        elapsed = time_match(VULNERABLE_PATTERN, subject)
        results.append((n, elapsed))
        if elapsed > PER_STEP_CAP_S or n >= 40:
            break
        n += 2
    return results


def fixed_scenario(lengths):
    """Same crafted term, but escaped by escapeRegex() first -- matches as a
    literal string, so it's a single linear scan regardless of length."""
    results = []
    for n in lengths:
        subject = "a" * n + "!"
        elapsed = time_match(SAFE_PATTERN, subject)
        results.append((n, elapsed))
    return results


def main():
    print("=== BEFORE FIX: raw term compiled straight into $regex ===")
    print(f"(growing n until one match exceeds {PER_STEP_CAP_S}s, cap n=40)")
    vuln_results = vulnerable_scenario()
    for n, elapsed in vuln_results:
        print(f"  subject length {n:>3} -> {elapsed*1000:12.3f} ms")

    print("\n=== AFTER FIX: escapeRegex(term) applied first (same lengths) ===")
    lengths = [n for n, _ in vuln_results]
    fixed_results = fixed_scenario(lengths)
    for n, elapsed in fixed_results:
        print(f"  subject length {n:>3} -> {elapsed*1000:12.3f} ms")

    worst_n = vuln_results[-1][0]
    print(f"\nProfiling the vulnerable scenario at n={worst_n} with cProfile...")
    profiler = cProfile.Profile()
    profiler.enable()
    subject = "a" * worst_n + "!"
    re.match(VULNERABLE_PATTERN, subject)
    profiler.disable()

    prof_path = HERE / "redos_profile.prof"
    profiler.dump_stats(str(prof_path))

    stats = pstats.Stats(str(prof_path))
    stats.sort_stats("cumulative")
    txt_path = HERE / "redos_profile_pstats.txt"
    with open(txt_path, "w") as f:
        stats.stream = f
        f.write(f"Profiled subject: 'a'*{worst_n} + '!'  against pattern {VULNERABLE_PATTERN!r}\n\n")
        stats.print_stats(15)

    summary_path = HERE / "redos_impact_summary.txt"
    with open(summary_path, "w") as f:
        f.write("BEFORE FIX (raw term -> $regex)\n")
        for n, elapsed in vuln_results:
            f.write(f"  n={n:>3}  {elapsed*1000:12.3f} ms\n")
        f.write("\nAFTER FIX (escapeRegex(term) -> $regex)\n")
        for n, elapsed in fixed_results:
            f.write(f"  n={n:>3}  {elapsed*1000:12.3f} ms\n")

    print(f"Wrote {prof_path}")
    print(f"Wrote {txt_path}")
    print(f"Wrote {summary_path}")
    print("Open interactively with: snakeviz " + str(prof_path))


if __name__ == "__main__":
    main()

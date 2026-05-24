import json
import os
import time
from pathlib import Path
from textwrap import dedent
from urllib import error, request

from dotenv import load_dotenv


ROOT = Path(__file__).resolve().parents[1]
QUESTIONS_PATH = ROOT / "backend" / "src" / "data" / "questions.json"
INGEST_URL = "http://localhost:8000/ingest"
LLM_MODEL = "gemini-2.5-flash"
TOPIC_TARGET_WORDS = 300
TOPIC_OVERLAP_WORDS = 40
REQUEST_DELAY_SECONDS = 0.5

load_dotenv(Path(__file__).resolve().parent / ".env")

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "")
if not GEMINI_API_KEY:
    raise RuntimeError("GEMINI_API_KEY is required in rag-service/.env")


def build_topic(
    topic: str,
    concept: str,
    pattern_recognition: str,
    approach: str,
    complexity: str,
    common_mistakes: str,
    leetcode_patterns: str,
    code_template: str,
) -> str:
    text = dedent(
        f"""
        TOPIC: {topic}

        1. CONCEPT:
        {concept}

        2. PATTERN RECOGNITION:
        {pattern_recognition}

        3. APPROACH:
        {approach}

        4. COMPLEXITY:
        {complexity}

        5. COMMON MISTAKES:
        {common_mistakes}

        6. LEETCODE PATTERNS:
        {leetcode_patterns}

        7. CODE TEMPLATE:
        {code_template}
        """
    ).strip()

    if len(text.split()) < 600:
        raise ValueError(
            f"Topic '{topic}' is below 600 words. Current count: {len(text.split())}"
        )

    return text


TOPIC_CONTENT = {
    "Arrays": build_topic(
        "Arrays",
        """
        Arrays are the baseline contiguous storage structure that almost every other interview topic builds on top of. Internally, an array stores values in sequential memory locations, which is why random access is O(1): if you know the base address and the index, the machine can jump straight to the target element. That is the main reason arrays exist. They trade expensive middle insertions and deletions for very fast indexing, compact memory layout, and cache-friendly iteration. In interviews, arrays are not just "a list of numbers." They are the default representation for frequency tables, prefix sums, sliding windows, intervals, heaps, and dynamic programming tables. A strong candidate thinks about arrays at two layers: the low-level storage model and the high-level pattern model. Low-level understanding explains why scanning is cheap and shifting is expensive. High-level understanding explains why so many LeetCode problems start with an array and then ask you to apply another technique on top of it. Arrays also force discipline about boundaries, because most bugs come from starting or stopping one step too early.
        """,
        """
        Arrays are signaled by phrases like "given an array of integers," "return an index," "find a subarray," "count pairs," "rearrange in place," "prefix/suffix," "continuous segment," or "sorted array." If a problem emphasizes indices, in-place updates, fixed order, or contiguous segments, array reasoning comes first. If you see "largest sum over a contiguous portion," think array plus prefix sum or sliding window. If you see "modify without extra space," think in-place array manipulation. If you see "sorted array," think binary search or two pointers layered on the array. If you see "for each position," think precomputation such as prefix products or running maxima. Arrays are also the first thing to consider when constraints are large enough that nested loops look suspicious. The array itself might not be the final technique, but it usually dictates how the data can be traversed, reused, and updated.
        """,
        """
        Start by asking what the array order means. Is the order fixed and important, or can the array be sorted? Next ask whether the problem needs a single pass, two passes, or precomputed helper arrays. Then identify whether the answer depends on each element alone, on pairs, on a contiguous range, or on the whole array aggregate. If each answer depends on earlier values, build a running state such as minimum so far, prefix sum, or frequency map. If the answer depends on both ends, consider two pointers. If the problem asks for interval or window behavior, avoid restarting work for every index; carry state forward. If mutation is allowed, decide whether swapping, overwriting, or partitioning in place reduces space. Finally, validate boundary cases explicitly: empty arrays, one element, all equal values, all negative values, duplicates, and already sorted input. In interviews, a clean array solution usually comes from deciding what state can be reused instead of recomputed.
        """,
        """
        Reading or writing one index is O(1) because address arithmetic is constant time. Scanning the entire array is O(n). Middle insertion or deletion is O(n) because every later element may shift by one slot. Sorting turns many array problems into O(n log n), which is often acceptable when it simplifies the logic. Space depends on whether you use the input array only, a few scalar variables, helper arrays such as prefix sums, or external maps. Interviewers care less about memorized complexity tables and more about whether you can explain why a second pass is still linear, why an in-place partition is constant extra space, or why a helper array is worth the memory because it removes repeated work.
        """,
        """
        Common array mistakes include forgetting that indices and values are different, which breaks problems like Two Sum when people return the numbers instead of the positions. Another bug is updating the same array in place before later positions have read the old value, which corrupts state in product or DP-style problems. A third mistake is using nested loops by habit even when the repeated work can be summarized by a running statistic. A fourth mistake is hand-waving edge cases: empty arrays, one-element arrays, duplicates, and integer overflow in languages like C++. Candidates also lose points by sorting an array when the original order matters for index-based answers.
        """,
        """
        Two Sum uses an array plus a hashmap because the key insight is that each element asks whether its complement was seen earlier, reducing O(n^2) pair search to O(n). Best Time to Buy and Sell Stock uses an array scan where the insight is to track the minimum price so far and compare every later price against it. Product of Array Except Self uses prefix and suffix products because each position wants "everything except me," which is reusable structure. Find Pivot Index uses running sums because the equality of left and right totals can be checked from a total sum and a moving prefix. Move Zeroes uses in-place compaction because the relative order of non-zero values must remain stable. Maximum Average Subarray I uses a fixed-length sliding window on top of the array because every candidate segment differs from the previous one by exactly one entering and one leaving element.
        """,
        """
        Python:
        ```python
        def array_template(nums):
            # Keep a running answer instead of recomputing from scratch.
            answer = 0
            running_state = 0

            for index, value in enumerate(nums):
                # Update whatever summary the problem needs:
                # min so far, max so far, prefix sum, count, etc.
                running_state += value

                # Use the updated state to improve the answer.
                answer = max(answer, running_state)

            return answer
        ```

        C++:
        ```cpp
        int arrayTemplate(const vector<int>& nums) {
            // Keep scalar state so the loop stays O(n) and cache-friendly.
            int answer = 0;
            int runningState = 0;

            for (int i = 0; i < (int)nums.size(); ++i) {
                // Update the reusable summary for the current prefix.
                runningState += nums[i];

                // Update the best answer seen so far.
                answer = max(answer, runningState);
            }

            return answer;
        }
        ```
        The template is intentionally generic. In interviews, the real skill is choosing the right reusable state for the array rather than writing a fancy loop.
        """,
    ),
    "Two Pointers": build_topic(
        "Two Pointers",
        """
        Two pointers is a coordination pattern for working on ordered data without restarting work. Internally, it means maintaining two indices that represent a region, a pair, or two moving scans. The pattern exists because many array and string problems have monotonic structure: once a left/right pair fails in one direction, moving the correct pointer is the only useful next action. That lets you convert a quadratic search into a linear or near-linear walk. There are several flavors. Opposite-direction pointers start at both ends and move inward, common in sorted arrays and palindrome checks. Same-direction pointers maintain a window or compact elements in place. Fast/slow pointers advance at different speeds, common in linked lists. The deeper idea is not "use two variables." It is "preserve an invariant while each move discards an entire family of impossible answers." When candidates explain the invariant clearly, the pattern becomes easy to trust and easy to debug.
        """,
        """
        Look for phrases like "sorted array," "pair with target sum," "remove duplicates in place," "reverse vowels," "move zeroes," "palindrome ignoring punctuation," "longest window," or "choose two lines maximizing area." In sorted arrays, if the current pair is too small, moving the smaller side is usually forced. In compaction problems, phrases like "keep relative order" and "in place" are strong signals for read/write pointers. In strings, if a problem asks you to compare characters from both ends or skip non-alphanumeric characters, two pointers should be high on the list. If brute force checks many overlapping pairs or windows, ask whether two pointers can reuse previous progress instead of restarting the inner loop.
        """,
        """
        First define what each pointer means. Is left the start of a candidate region and right the end? Is one pointer writing and the other reading? Next define the invariant. For example, "all elements before write are already arranged correctly" or "the current window satisfies the problem condition." Then decide the movement rule. In sorted-pair problems, compare the current sum and move the pointer that can actually improve the result. In compaction problems, scan with read; when an element should be kept, write it and advance write. In window problems, expand right to gain information and shrink left only when the invariant is violated or when you can improve the answer. Finally, dry-run small examples because pointer code is simple only if pointer meaning and movement rules are explicit.
        """,
        """
        Many two-pointer solutions are O(n) because each pointer moves at most n times. Even if there is a nested-looking while loop, the total movement is still linear if left never moves backward and right never moves backward. Space is usually O(1) beyond the input because the technique relies on indices rather than helper structures. The exception is when two pointers are combined with sorting, which changes the total time to O(n log n) but often still keeps extra space low. The best interview explanation is "each pointer only advances, so total work across all iterations is bounded by the number of positions."
        """,
        """
        A frequent bug is moving the wrong pointer in sorted problems. If the sum is too small and you move the larger side, nothing improves. Another mistake is updating the answer before restoring the invariant in window-style problems. People also mix up inclusive and exclusive boundaries, which causes off-by-one window lengths. In write/read compaction, candidates sometimes increment write even when the current value should not be kept, leaving garbage in the "compacted" prefix. In strings, skipping characters without rechecking bounds can produce index errors.
        """,
        """
        Is Subsequence uses two pointers because each character in s wants the earliest matching character in t, and once t advances there is no value in revisiting earlier characters. Reverse Vowels of a String uses opposite pointers because only vowels need swapping and everything else is skipped. Move Zeroes uses read/write pointers because the insight is to compact all non-zero values first and then fill the tail with zeroes. Container With Most Water uses inward pointers because the area is limited by the shorter wall, so moving the taller wall alone cannot help. Max Number of K-Sum Pairs can use sorting plus inward pointers because each comparison eliminates a pair candidate. String Compression uses two pointers to count runs and write compressed output back into the same array.
        """,
        """
        Python:
        ```python
        def two_pointer_template(nums, target):
            # Assumes nums is sorted.
            left, right = 0, len(nums) - 1

            while left < right:
                current = nums[left] + nums[right]

                if current == target:
                    return left, right
                if current < target:
                    # Need a larger sum, so move the smaller side.
                    left += 1
                else:
                    # Need a smaller sum, so move the larger side.
                    right -= 1

            return -1, -1
        ```

        C++:
        ```cpp
        pair<int, int> twoPointerTemplate(const vector<int>& nums, int target) {
            // Assumes nums is sorted.
            int left = 0;
            int right = (int)nums.size() - 1;

            while (left < right) {
                int current = nums[left] + nums[right];

                if (current == target) {
                    return {left, right};
                } else if (current < target) {
                    // Increase the sum by moving the smaller value.
                    ++left;
                } else {
                    // Decrease the sum by moving the larger value.
                    --right;
                }
            }

            return {-1, -1};
        }
        ```
        This core pattern changes slightly across strings, arrays, and linked lists, but the invariant-first mindset stays the same.
        """,
    ),
    "Sliding Window": build_topic(
        "Sliding Window",
        """
        Sliding window is what you use when the object of interest is a contiguous segment and neighboring segments overlap so much that recomputing them from scratch is wasteful. Internally, the window is represented by left and right boundaries plus a small amount of state such as a sum, count map, frequency deficit, or number of zeroes. The technique exists because many subarray and substring problems differ from one candidate to the next by only one entering item and one leaving item. Instead of exploring all O(n^2) segments, you update the maintained state as the boundaries move. There are two major forms. Fixed-size windows are used when k is given directly. Variable-size windows are used when the problem says "at most," "at least," "no more than," or "longest/shortest segment satisfying a condition." The important conceptual jump is that the window is not just a range; it is a range plus an invariant that makes incremental updates possible.
        """,
        """
        Sliding window is signaled by phrases like "subarray," "substring," "contiguous," "length k," "at most k changes," "longest segment with condition," "minimum window," or "maximum average over a fixed range." If you see a brute force that checks every possible start and end, ask whether the second segment largely overlaps the first. Fixed-k problems like Maximum Average Subarray I or Maximum Number of Vowels in a Substring of Given Length are classic windows. Variable windows appear when the statement says "flip at most k zeroes," "longest substring without repeating characters," or "smallest subarray with sum at least target." A good rule is: if the answer depends on a contiguous region and the region only grows or shrinks by one step at a time, window thinking should start immediately.
        """,
        """
        First classify the problem as fixed-size or variable-size. For fixed size, preload the first window, compute its score, then slide by adding the new right value and removing the old left value. For variable size, expand right one step at a time and update the maintained state. If the window violates the condition, shrink left until the invariant is restored. After each expansion or after restoration, update the answer depending on whether you want the longest valid window, shortest valid window, or count of windows. The most common interview challenge is deciding what state to maintain. Sums work for numeric windows, frequency arrays work for characters, and a count of "bad" items works for constraints like zeroes or duplicates. A clean dry-run should show that every pointer move changes state in O(1).
        """,
        """
        Sliding window is often O(n) because each element enters the window once and leaves the window once. Even if the code has a while loop inside a for loop, total left movement is bounded by n when left only moves forward. Space depends on the state. A running sum uses O(1). A character frequency map is O(alphabet) or O(k distinct values). If a candidate says "the inner while makes it O(n^2)," that usually means they have not yet internalized amortized pointer movement. Explain complexity in terms of how often each index can be added or removed from the maintained state.
        """,
        """
        Common mistakes include shrinking the window too early, before the answer is updated for the current valid range. Another is forgetting to remove the left element's contribution when left moves, which makes the state drift away from the real window. Candidates also confuse "at most k" and "exactly k" conditions; many exact-k problems are solved indirectly by at-most helper functions. In fixed-size windows, off-by-one bugs are common when people update the answer before the first full window is formed. Another frequent error is trying to use sliding window on problems with negative numbers when the chosen invariant depends on monotonic sums.
        """,
        """
        Maximum Average Subarray I uses a fixed-size window because every length-k segment differs by one entering and one leaving number. Maximum Number of Vowels in a Substring of Given Length is the same pattern with a vowel count instead of a sum. Max Consecutive Ones III uses a variable window where the invariant is "the window contains at most k zeroes." Longest Subarray of 1's After Deleting One Element is similar, except the allowed zero count is one and the answer subtracts one deletion. Best Time to Buy and Sell Stock is sometimes taught as a sliding relation between buy and sell days, though the stronger interview framing is min-so-far. Reverse Words in a String is not a sliding window problem, and recognizing that difference matters because not every string problem is contiguous-count maintenance.
        """,
        """
        Python:
        ```python
        def sliding_window_template(nums, k):
            left = 0
            zero_count = 0
            answer = 0

            for right, value in enumerate(nums):
                # Expand the window by including nums[right].
                if value == 0:
                    zero_count += 1

                # Shrink until the invariant becomes valid again.
                while zero_count > k:
                    if nums[left] == 0:
                        zero_count -= 1
                    left += 1

                # The current window [left, right] is valid.
                answer = max(answer, right - left + 1)

            return answer
        ```

        C++:
        ```cpp
        int slidingWindowTemplate(const vector<int>& nums, int k) {
            int left = 0;
            int zeroCount = 0;
            int answer = 0;

            for (int right = 0; right < (int)nums.size(); ++right) {
                // Expand the window by taking nums[right].
                if (nums[right] == 0) {
                    ++zeroCount;
                }

                // Shrink until the window satisfies the rule again.
                while (zeroCount > k) {
                    if (nums[left] == 0) {
                        --zeroCount;
                    }
                    ++left;
                }

                // Measure the valid window.
                answer = max(answer, right - left + 1);
            }

            return answer;
        }
        ```
        Change the maintained state, not the mental model. That is the reusable lesson.
        """,
    ),
    "Stack": build_topic(
        "Stack",
        """
        A stack is a last-in, first-out structure. Internally, it models nested state: the most recently opened context is the first one that must be resolved. That is why stacks are natural for parentheses, undo operations, recursive expansion, monotonic ordering, and deferred decisions. The structure exists because many problems have the rule "the next action depends on the most recent unresolved item." If you try to scan without a stack, you often lose exactly the piece of state you need when a conflict appears later. Interview stacks come in two broad flavors. Explicit stacks hold unmatched symbols or prior values. Monotonic stacks hold items in sorted order so future elements can resolve waiting answers efficiently. Candidates often think of stacks as just push and pop, but the real insight is that a stack represents the frontier of unresolved work. Every time you pop, you are saying some later information has now settled an earlier open question.
        """,
        """
        Stack problems are signaled by phrases like "valid parentheses," "remove stars," "decode nested expression," "next greater element," "daily temperatures," "asteroid collision," or "process operations in reverse nested order." If the statement has matching pairs, nested structure, or the idea of undoing the most recent event, think stack. If each element wants the next larger or smaller thing to the right, think monotonic stack. If a later symbol can erase or dominate the most recent unresolved symbol, that is another strong signal. When brute force repeatedly scans backward to find the previous unresolved item, a stack is usually the missing data structure.
        """,
        """
        First decide what unresolved item must be remembered. If it is literal nesting, push symbols or indices when you open a context and pop when you close it. If it is a "next greater/smaller" relationship, maintain a monotonic stack of indices so you can assign answers when a resolving value appears. In collision-style problems, while the new item conflicts with the top of the stack, resolve the conflict and keep going until no conflict remains. The practical interview habit is to store indices when you need distances or output positions, and store values when you only care about the objects themselves. Always define the pop condition clearly before coding. That condition is usually the whole algorithm.
        """,
        """
        Most stack solutions are O(n) because each item is pushed once and popped at most once. This is especially important in monotonic stack problems that superficially look nested. The while loop is cheap in aggregate because every pop is permanent. Space is O(n) in the worst case when nothing can be resolved early, such as a strictly decreasing array in a next-greater problem. The best explanation is not "stack equals O(n)." It is "every element enters and leaves the unresolved frontier at most one time."
        """,
        """
        A classic bug is storing values when indices are required for distances or updates, which breaks Daily Temperatures-style problems. Another mistake is using if when the resolution rule needs while, so chains of collisions or multiple smaller elements never get fully processed. Candidates also forget to define equal-value behavior in monotonic stacks; whether equal values stay or pop changes correctness. In nested expression problems, people sometimes pop without first checking emptiness, which hides malformed inputs or crashes at boundaries. One more subtle error is pushing too early before all collisions or reductions are resolved.
        """,
        """
        Removing Stars From a String uses a simple stack because every star deletes the most recent undeleted character. Asteroid Collision uses a stack because only the most recent right-moving asteroid can collide with a new left-moving asteroid, and chains of collisions must be resolved in LIFO order. Decode String uses stacks to hold counts and partial strings across nested brackets. Daily Temperatures uses a monotonic decreasing stack of indices so each warmer temperature can resolve waiting colder days. Online Stock Span uses a monotonic stack because each price absorbs earlier prices less than or equal to it. Maximum Twin Sum of a Linked List can also be solved with a stack by pairing the second half against the stored first half.
        """,
        """
        Python:
        ```python
        def monotonic_stack_template(nums):
            stack = []  # stores indices with unresolved answers
            answer = [0] * len(nums)

            for i, value in enumerate(nums):
                # Resolve all earlier positions that this value can answer.
                while stack and nums[stack[-1]] < value:
                    prev_index = stack.pop()
                    answer[prev_index] = i - prev_index

                # Current index is still unresolved for now.
                stack.append(i)

            return answer
        ```

        C++:
        ```cpp
        vector<int> monotonicStackTemplate(const vector<int>& nums) {
            stack<int> st;                 // stores unresolved indices
            vector<int> answer(nums.size(), 0);

            for (int i = 0; i < (int)nums.size(); ++i) {
                // Resolve every earlier index whose next larger value is nums[i].
                while (!st.empty() && nums[st.top()] < nums[i]) {
                    int prevIndex = st.top();
                    st.pop();
                    answer[prevIndex] = i - prevIndex;
                }

                // Current index waits for a future resolver.
                st.push(i);
            }

            return answer;
        }
        ```
        Replace the comparison or the stored payload and you get most interview stack patterns.
        """,
    ),
    "Queue": build_topic(
        "Queue",
        """
        A queue is a first-in, first-out structure. Internally, it models fair processing order: whoever arrives earliest gets handled earliest. That is why queues are natural for breadth-first search, streaming counters, task scheduling, round-based simulations, and rate windows. The reason queues exist is that some systems and algorithms depend on chronological order rather than recency. In interviews, the most important queue mindset is level-by-level expansion. In BFS, the nodes discovered first are the ones at the shortest distance, so the queue preserves correctness. In data-stream problems, the oldest items are also the first candidates to expire, which again matches FIFO behavior. Candidates who only memorize "queue for BFS" miss the deeper point: a queue holds items whose turn will come in exactly the order they became ready.
        """,
        """
        Queue signals include "level order traversal," "minimum number of steps," "shortest path in an unweighted graph," "process in rounds," "recent calls in the last 3000 ms," "simulate senators taking turns," and "first available task." If the problem asks for nearest exit, minimum moves, infection spread by minute, or any wave that expands uniformly, BFS with a queue should be immediate. If the input is a time-ordered stream and you need to remove expired items from the front, a queue is a strong fit. If the state evolves in rounds, queue-based simulation often mirrors the story directly.
        """,
        """
        First define what one queue item represents. In BFS it might be a node, or a node plus distance, or a cell plus step count. Initialize the queue with all starting states. Then repeatedly pop the front item, process it, and push valid next states that have not been seen yet. For multi-source BFS, enqueue all initial sources before the loop. For stream windows, enqueue each new event and pop from the front while it is expired. For turn-based simulation, maintain separate queues for each faction and compare the earliest ready positions. The discipline is simple: when something becomes ready, enqueue it; when its turn arrives, dequeue it.
        """,
        """
        Basic queue operations are O(1) amortized with the right implementation, such as deque in Python. BFS over a graph or grid is O(V + E) because each vertex is enqueued and dequeued at most once and each edge is examined a bounded number of times. In grid BFS, this becomes O(rows * cols). Space is O(V) in the worst case because the queue can contain an entire frontier. The key explanation is that BFS cost is tied to total state exploration, not to the apparent nesting of loops over queue levels.
        """,
        """
        A common mistake is using a Python list with pop(0), which makes each dequeue O(n). Another is marking nodes visited too late, after dequeue instead of enqueue, which allows duplicates to flood the queue. Candidates also forget that BFS guarantees shortest path only in unweighted graphs; if edges have different costs, a plain queue is not enough. In round-based simulations, people sometimes mutate the same collection they are iterating without preserving order, which quietly breaks fairness. Another bug is forgetting to store coordinates or distance together when the answer depends on both.
        """,
        """
        Number of Recent Calls uses a queue because the oldest ping is always the first one that may fall out of the [t - 3000, t] range. Dota2 Senate uses two queues because each party's senators act in turn based on their original positions, and the earlier index acts first. Nearest Exit from Entrance in Maze uses BFS because the first time you reach an exit is the minimum number of steps in an unweighted grid. Rotting Oranges is multi-source BFS because all rotten oranges spread simultaneously each minute. Maximum Level Sum of a Binary Tree uses level-order traversal with a queue because sums are computed one depth at a time. Graph BFS problems in general use the queue to preserve shortest frontier order.
        """,
        """
        Python:
        ```python
        from collections import deque

        def bfs_template(graph, start):
            queue = deque([start])
            visited = {start}
            distance = {start: 0}

            while queue:
                node = queue.popleft()

                for neighbor in graph[node]:
                    if neighbor in visited:
                        continue

                    # Mark visited when enqueuing to avoid duplicates.
                    visited.add(neighbor)
                    distance[neighbor] = distance[node] + 1
                    queue.append(neighbor)

            return distance
        ```

        C++:
        ```cpp
        unordered_map<int, int> bfsTemplate(const vector<vector<int>>& graph, int start) {
            queue<int> q;
            unordered_set<int> visited;
            unordered_map<int, int> distance;

            q.push(start);
            visited.insert(start);
            distance[start] = 0;

            while (!q.empty()) {
                int node = q.front();
                q.pop();

                for (int neighbor : graph[node]) {
                    if (visited.count(neighbor)) {
                        continue;
                    }

                    // Mark on enqueue so each node enters the queue once.
                    visited.insert(neighbor);
                    distance[neighbor] = distance[node] + 1;
                    q.push(neighbor);
                }
            }

            return distance;
        }
        ```
        If the story says "earliest discovered should be processed first," a queue is usually the right mental model.
        """,
    ),
    "Binary Search": build_topic(
        "Binary Search",
        """
        Binary search is not really about arrays; it is about searching a monotonic decision space. Internally, you maintain a low boundary, a high boundary, and an invariant about where the answer can still live. The structure exists because when the search space is ordered and the predicate flips only once, checking the midpoint lets you discard half the remaining candidates immediately. In interviews, this applies both to sorted arrays and to "answer search" problems where you are not looking for a value directly but for the smallest or largest feasible parameter. Strong candidates understand both versions. Search-in-array binary search asks where a target or boundary is located. Binary search on answer asks whether a chosen rate, capacity, or threshold works. The algorithm feels simple, but correctness depends on maintaining a precise invariant about which side of mid can still contain the answer.
        """,
        """
        Signals include "sorted array," "find first/last occurrence," "peak element," "smallest k such that condition holds," "minimum speed," "can we do it in h hours," and "count successful pairs after sorting." If a statement asks you to minimize or maximize a numeric answer under a feasibility check, that is classic answer-space binary search. If the input is already sorted or can be sorted once and then queried repeatedly, think binary search. Phrases like "log n expected," "search insert position," and "monotonic condition" are especially strong. A useful rule: if increasing x only makes feasibility better or worse, then the predicate may be monotonic enough for binary search.
        """,
        """
        First identify the search domain and the monotonic predicate. For arrays, that might be whether nums[mid] is too small, too large, or equal. For answer search, define can(mid) and prove that all larger values work or all smaller values work. Then choose the invariant carefully. For example, "left is infeasible, right is feasible" or "the answer lies in [left, right]." Compute mid safely, evaluate the predicate, and move one boundary while preserving the invariant. Continue until the interval collapses to the desired boundary. In interviews, candidates should say explicitly whether they are searching for any match, the first true, the last false, the lower bound, or the minimum feasible answer. Those are different templates, not one interchangeable loop.
        """,
        """
        Binary search on an array is O(log n) because each comparison halves the remaining range. Binary search on answer is O(log range * cost_of_check), because the midpoint test itself may scan the whole input. Koko Eating Bananas, for example, is O(n log maxPile) because every speed check sums hours across all piles. Space is usually O(1) unless the feasibility check allocates helpers. The important explanation is not just halving; it is that monotonicity makes the discarded half provably useless.
        """,
        """
        The most common mistake is writing a loop without a formal invariant, then patching off-by-one bugs randomly. Another is returning mid immediately in problems that need the first or last valid position rather than any valid position. Candidates also choose impossible bounds in answer search, such as starting the minimum speed at zero. Integer overflow in mid computation used to matter more in C++, though `left + (right - left) / 2` is still the standard safe habit. A subtler bug is using binary search when the predicate is not actually monotonic.
        """,
        """
        Guess Number Higher or Lower is the purest version: the feedback tells you which half to discard. Successful Pairs of Spells and Potions uses sorting plus lower_bound because each spell needs the first potion that makes the product reach success. Find Peak Element uses binary search on slope: if the array is rising at mid, a peak must exist to the right. Koko Eating Bananas is answer-space binary search because higher eating speeds are always at least as feasible as lower ones. Search in a Binary Search Tree is conceptually binary search over tree structure. Maximum level sum or BFS problems are not binary search problems, and being able to reject binary search is as important as recognizing it.
        """,
        """
        Python:
        ```python
        def first_true(low, high, can):
            # Search for the smallest value in [low, high] that satisfies can(x).
            while low < high:
                mid = low + (high - low) // 2

                if can(mid):
                    # mid works, so keep it and everything left of it.
                    high = mid
                else:
                    # mid fails, so the answer must be to the right.
                    low = mid + 1

            return low
        ```

        C++:
        ```cpp
        int firstTrue(int low, int high, function<bool(int)> can) {
            // Search for the smallest feasible value.
            while (low < high) {
                int mid = low + (high - low) / 2;

                if (can(mid)) {
                    // mid is feasible, so the answer is in [low, mid].
                    high = mid;
                } else {
                    // mid is infeasible, so discard it.
                    low = mid + 1;
                }
            }

            return low;
        }
        ```
        If you can state the predicate and the invariant in one sentence each, binary search becomes much easier to trust.
        """,
    ),
    "Linked List": build_topic(
        "Linked List",
        """
        A linked list stores nodes that point to one another instead of sitting in contiguous memory. Internally, that means traversal is sequential rather than index-based, and insertion or deletion near a known node is cheap because you only relink pointers instead of shifting a whole array. Linked lists exist to support flexible structural updates when random access is not the priority. In interviews, linked list problems are really pointer-management problems. The nodes themselves are simple; the challenge is preserving access to all needed parts while changing the structure safely. That is why dummy nodes, fast/slow pointers, and careful temporary variables matter so much. Good candidates do not narrate "now I move head." They narrate ownership: which node is previous, which node is current, which pointer would be lost if overwritten, and which invariant the processed portion already satisfies.
        """,
        """
        Signals include "singly linked list," "delete the middle node," "reverse the list," "reorder odd and even positions," "find the cycle," "find the midpoint," and "do it in place." If the problem gives a node structure with next pointers, the first instinct should be pointer traversal rather than array conversion, unless the conversion clearly simplifies a non-core step. Phrases like "without extra space" and "preserve nodes, only relink pointers" strongly suggest a direct list manipulation approach. If the answer depends on the middle, length parity, or meeting of two moving references, fast/slow pointers are often involved.
        """,
        """
        First decide whether the problem is about traversal, deletion, reversal, splitting, or merging. Use a dummy node whenever deleting or inserting near the head could create special cases. Maintain explicit names like prev, curr, next_node instead of reusing head for everything. For reverse operations, save the next pointer before overwriting curr.next. For middle problems, move slow by one and fast by two, so when fast finishes, slow identifies the target region. For reorder or twin-sum problems, the common pattern is split at the middle, reverse the second half, then walk both halves together. The safest interview habit is to draw a three-node snapshot and say out loud which pointers change first and why no part of the list becomes unreachable.
        """,
        """
        Traversing a linked list is O(n). Reversing is O(n) because every node changes next once. Fast/slow techniques remain O(n) because the fast pointer simply moves through the list once, just at double speed. Space is usually O(1) when the manipulation is in place, though recursion on a list uses O(n) call stack. The main explanation is that linked lists save shifting cost but lose random access, so any attempt to "jump to index i" is already linear.
        """,
        """
        A common mistake is overwriting curr.next before saving the original next node, which disconnects the rest of the list. Another is forgetting a dummy node when the head itself may be deleted, leading to head-edge-case bugs. Candidates also confuse node positions with node values, especially in odd-even problems where "odd" means index parity, not odd numeric value. In fast/slow code, not checking fast and fast.next safely causes null-pointer errors. Finally, some people convert everything to arrays immediately, which can be acceptable but often misses the point of the exercise.
        """,
        """
        Reverse Linked List is the canonical pointer-reversal problem where the key insight is to preserve the remaining list before redirecting the current node. Delete the Middle Node of a Linked List uses fast/slow pointers because one scan can locate the predecessor of the middle node. Odd Even Linked List uses list partitioning by position parity while preserving internal order in both groups. Maximum Twin Sum of a Linked List typically reverses the second half so first-half and second-half nodes can be compared in lockstep. Merge-type linked list problems are usually driven by dummy nodes. Problems that ask for cycle entry or cycle detection use fast/slow meeting logic even though they are not in LC75.
        """,
        """
        Python:
        ```python
        def reverse_list(head):
            prev = None
            curr = head

            while curr:
                # Save the rest of the list before changing pointers.
                next_node = curr.next

                # Reverse the current link.
                curr.next = prev

                # Advance both traversal pointers.
                prev = curr
                curr = next_node

            # prev is the new head after the loop finishes.
            return prev
        ```

        C++:
        ```cpp
        ListNode* reverseList(ListNode* head) {
            ListNode* prev = nullptr;
            ListNode* curr = head;

            while (curr != nullptr) {
                // Save the original next node before overwriting anything.
                ListNode* nextNode = curr->next;

                // Reverse the direction of the current link.
                curr->next = prev;

                // Advance both pointers.
                prev = curr;
                curr = nextNode;
            }

            // prev points to the new head.
            return prev;
        }
        ```
        This template is the backbone for many higher-level linked list questions.
        """,
    ),
    "Trees": build_topic(
        "Trees",
        """
        Trees model hierarchical relationships where each node can branch to children. Internally, the key property is that there is exactly one simple path from the root to any node in a standard tree, which lets you reason recursively about subproblems. Trees exist because many domains are naturally hierarchical: file systems, expression structure, decision paths, and ordered maps. In interviews, tree problems are often really questions about traversal order and local-to-global information flow. DFS is good when an answer depends on descendants or root-to-node paths. BFS is good when an answer depends on levels. The most important conceptual shift is to stop thinking linearly. In a tree, every recursive call returns information about a whole subtree, and the parent combines those summaries. Once candidates understand that a node is the "interface" between its left and right subproblems, many tree questions become structured instead of magical.
        """,
        """
        Signals include "binary tree," "root," "left child," "right child," "depth," "path sum," "lowest common ancestor," "leaf sequence," "level order," and "visible from right side." If the statement refers to ancestors, descendants, subtrees, depth, or paths from the root, tree reasoning is primary. If the answer needs every level independently, think BFS. If the answer depends on the best result from children or on propagating a path condition downward, think DFS. If the problem asks for "any path downward" or "count paths with target sum," remember that not all tree paths start at the root.
        """,
        """
        First ask whether the information should flow top-down, bottom-up, or level-by-level. For top-down DFS, pass context such as current depth, current path sum, or maximum seen so far. For bottom-up DFS, let each child return a summary that the parent combines. For BFS, enqueue nodes level by level and process one breadth layer at a time. Define the base case early, especially for null nodes. Then define what one recursive call means. For example, "dfs(node) returns the height of the subtree" or "dfs(node, prefix) counts paths ending here." The single most useful tree interview habit is to say exactly what the recursive function returns before writing the first line of code.
        """,
        """
        Most binary-tree traversals are O(n) because each node is visited once. DFS recursion uses O(h) stack space where h is tree height, which is O(log n) for balanced trees and O(n) for skewed trees. BFS uses O(w) queue space where w is the maximum width of the tree. Complexity explanations should mention structure shape because balanced and skewed trees behave differently in auxiliary space. Candidates also get credit for noticing when a problem needs extra hash maps or prefix-sum tables on top of the traversal.
        """,
        """
        Common mistakes include forgetting null base cases, which leads to crashes or infinite recursion. Another is writing recursion that does extra repeated work because the return meaning was never defined clearly. Candidates also mix up node depth and subtree height, which are opposite directions. In BFS, failing to isolate each level before processing can break level-based answers. In path problems, people often assume every valid path must start at the root, which is false for Path Sum III. Finally, mutating shared global state without restoring it causes subtle bugs in backtracking-style tree traversals.
        """,
        """
        Maximum Depth of Binary Tree uses DFS or BFS because the key insight is that depth is one plus the maximum depth of the children. Leaf-Similar Trees uses DFS to collect leaves in left-to-right order and compare the resulting sequences. Count Good Nodes in Binary Tree is top-down DFS because each node's validity depends on the maximum value on the path from root to that node. Path Sum III often uses prefix sums plus DFS because paths can start anywhere but must go downward. Longest ZigZag Path in a Binary Tree tracks direction state while descending. Binary Tree Right Side View uses BFS or right-first DFS because the visible node at each depth is the last or first encountered under that traversal choice.
        """,
        """
        Python:
        ```python
        def dfs_template(node):
            if not node:
                # Return the identity value for an empty subtree.
                return 0

            left_value = dfs_template(node.left)
            right_value = dfs_template(node.right)

            # Combine child summaries into the current summary.
            return 1 + max(left_value, right_value)
        ```

        C++:
        ```cpp
        int dfsTemplate(TreeNode* node) {
            if (node == nullptr) {
                // Identity value for an empty subtree.
                return 0;
            }

            int leftValue = dfsTemplate(node->left);
            int rightValue = dfsTemplate(node->right);

            // Combine the child answers at the parent.
            return 1 + max(leftValue, rightValue);
        }
        ```
        Almost every tree problem is some variation of "define the return meaning, traverse, combine."
        """,
    ),
    "BST": build_topic(
        "BST",
        """
        A binary search tree is a binary tree with ordering structure: values in the left subtree are smaller than the node, and values in the right subtree are larger, under the chosen convention. That invariant exists so search, insert, and delete can ignore half the remaining tree at every step in a balanced shape. The BST is the tree analogue of binary search over an ordered collection. In interviews, BST problems are less about generic tree traversal and more about exploiting the order invariant. If you ignore the invariant, you can still solve many BST problems like ordinary trees, but you miss efficiency and usually the main point of the problem. Candidates should think in terms of range constraints: every node implicitly lives within allowed lower and upper bounds inherited from its ancestors. That viewpoint helps with validation, search, and ancestor logic.
        """,
        """
        Signals include "binary search tree," "ordered tree," "search for a value," "insert/delete in BST," "inorder gives sorted order," and "find successor/predecessor." If a problem explicitly names BST, you should immediately ask how the ordering reduces the search space. If the task is "find node with value x," plain tree DFS is valid but wasteful. If the task is validation, think range bounds, not just parent-child comparisons. If the problem wants sorted output from the tree, inorder traversal is the strongest signal.
        """,
        """
        First state the invariant you will use. For search, compare the target with the current node and recurse or iterate only into the relevant side. For validation, carry a low/high permissible range down the recursion and ensure each node stays strictly inside it. For deletion, split into the three standard cases: no child, one child, or two children. In the two-child case, replace with the inorder successor or predecessor and then delete that replacement node from its original location. For range queries, prune entire subtrees when the current node proves they are all too small or too large. Interviewers want to hear the pruning logic, not just generic traversal.
        """,
        """
        Search, insert, and delete are O(h) where h is the tree height. In a balanced BST that is O(log n). In a skewed BST it degrades to O(n). Traversals that visit all nodes remain O(n). Space is O(h) with recursion or O(1) extra with iterative search excluding the tree itself. Good complexity explanations always mention that BST guarantees are height-dependent rather than magically logarithmic in every shape.
        """,
        """
        A frequent mistake is validating a BST by checking only each node against its immediate children. That misses deeper violations such as a node in the right subtree of the root being smaller than the root. Another bug is mishandling duplicates because the chosen strict/non-strict convention is not stated clearly. In deletion, candidates often replace the node's value with a successor but forget to actually remove the successor node. People also default to full-tree DFS when the BST invariant would let them prune.
        """,
        """
        Search in a Binary Search Tree is the textbook example where comparing target versus node value tells you exactly one subtree is relevant. Delete Node in a BST uses the ordered structure to find the target and the inorder successor logic to preserve the invariant after deletion. Validate BST problems rely on allowable ranges from ancestors, not local checks. Kth smallest in BST uses inorder traversal because inorder order is sorted. Lowest common ancestor in a BST is simpler than in a general tree because the split point where one target goes left and the other goes right is the answer. Range Sum of BST uses pruning to skip subtrees that cannot contribute.
        """,
        """
        Python:
        ```python
        def search_bst(root, target):
            curr = root

            while curr:
                if curr.val == target:
                    return curr
                if target < curr.val:
                    # Target can only be in the left subtree.
                    curr = curr.left
                else:
                    # Target can only be in the right subtree.
                    curr = curr.right

            return None
        ```

        C++:
        ```cpp
        TreeNode* searchBST(TreeNode* root, int target) {
            TreeNode* curr = root;

            while (curr != nullptr) {
                if (curr->val == target) {
                    return curr;
                } else if (target < curr->val) {
                    // Only the left subtree can still contain the target.
                    curr = curr->left;
                } else {
                    // Only the right subtree can still contain the target.
                    curr = curr->right;
                }
            }

            return nullptr;
        }
        ```
        The reusable interview habit is to say which subtree you can discard and why.
        """,
    ),
    "Tries": build_topic(
        "Tries",
        """
        A trie, or prefix tree, stores strings character by character so common prefixes share structure. Internally, each node represents a prefix, and edges represent extending that prefix by one character. The reason tries exist is that prefix queries are different from exact-value queries. A hashmap can tell you whether a whole word exists, but it cannot naturally organize all words beginning with the same prefix. A trie makes prefix work explicit in the data structure itself. In interviews, tries are valuable when repeated prefix checks dominate the problem. Instead of rescanning every stored word for each query, you walk the prefix once and then continue from the corresponding node. The deeper mental model is that the data structure indexes by progressive constraints. Each character narrows the candidate set, so later operations can start from a partially solved search state.
        """,
        """
        Trie signals include "startsWith," "prefix," "autocomplete," "dictionary of words," "search suggestions," "replace words by roots," and "find all words with a common prefix." If the same set of strings is queried many times by incremental prefixes, a trie is usually more natural than repeated sorting or repeated scanning. If the statement says "after each character is typed," that is a powerful sign because the search state evolves prefix by prefix. A trie is also a strong candidate when the alphabet is manageable and the problem's value comes from shared prefixes rather than from arbitrary substring matching.
        """,
        """
        Start by defining the trie node: it needs child references and usually an end-of-word flag. For insertion, walk characters from the root, creating missing child nodes, then mark the final node as a word ending. For exact search, walk the characters and ensure the final node is an end node. For prefix queries, walk the prefix and return success if traversal finishes. For suggestion systems, traverse to the prefix node first, then perform DFS from there to collect a limited number of lexicographically ordered completions. In interviews, one subtle but important step is deciding whether to store full words at terminal nodes, only flags, or counts depending on what the later query operations need.
        """,
        """
        Insert, exact search, and prefix check are O(L) where L is the length of the word or prefix, because you process one character per step. Space can be large in the worst case because every distinct prefix may need its own node, but shared prefixes are exactly what the trie exploits to make repeated queries efficient. Suggestion collection adds traversal cost for the returned subtree. Interview complexity explanations should mention that the cost depends on string length rather than the number of stored words, once the trie already exists.
        """,
        """
        Common mistakes include forgetting the end-of-word flag, which makes every prefix look like a full word. Another bug is iterating through children in arbitrary order when the problem wants lexicographic suggestions. Candidates also underestimate memory usage and choose giant fixed arrays when the alphabet or dataset does not justify them. In search suggestion problems, people sometimes perform a full DFS from the root for every prefix instead of reusing the prefix node reached so far. Finally, they may confuse prefix matching with substring matching; tries are not automatically good for arbitrary substrings.
        """,
        """
        Implement Trie (Prefix Tree) is the direct warm-up: insert, search, and startsWith all map to the same walk structure with different terminal checks. Search Suggestions System uses a trie effectively because after each typed character you want up to three lexicographically smallest products with that prefix. Replace Words uses a trie because you want the shortest dictionary root that prefixes each sentence word. Word search with a dictionary often uses trie plus DFS on a board because the trie prunes dead prefixes early. Longest common prefix across many words can be read from a trie path until branching occurs. Even when LC75 only includes two explicit trie problems, the prefix-sharing concept transfers broadly.
        """,
        """
        Python:
        ```python
        class TrieNode:
            def __init__(self):
                self.children = {}
                self.is_word = False

        class Trie:
            def __init__(self):
                self.root = TrieNode()

            def insert(self, word):
                node = self.root
                for ch in word:
                    # Create the next prefix node if it does not exist yet.
                    node = node.children.setdefault(ch, TrieNode())
                node.is_word = True

            def starts_with(self, prefix):
                node = self.root
                for ch in prefix:
                    if ch not in node.children:
                        return False
                    node = node.children[ch]
                return True
        ```

        C++:
        ```cpp
        struct TrieNode {
            unordered_map<char, TrieNode*> children;
            bool isWord = false;
        };

        class Trie {
        public:
            TrieNode* root = new TrieNode();

            void insert(const string& word) {
                TrieNode* node = root;
                for (char ch : word) {
                    // Create the child node for this extended prefix if needed.
                    if (!node->children.count(ch)) {
                        node->children[ch] = new TrieNode();
                    }
                    node = node->children[ch];
                }
                node->isWord = true;
            }
        };
        ```
        The reusable principle is that prefixes become first-class nodes instead of being recomputed repeatedly.
        """,
    ),
    "Heap/Priority Queue": build_topic(
        "Heap/Priority Queue",
        """
        A heap is a partially ordered tree usually stored in an array. In a min-heap, every parent is less than or equal to its children, so the smallest element is always at the root. A max-heap does the symmetric thing for the largest element. The structure exists because many problems need repeated access to the current best candidate but do not need the entire dataset fully sorted all the time. Sorting everything up front can be wasteful if you only need the top k or the next minimum repeatedly. In interviews, a priority queue is the "always pull the best available item next" data structure. The key is to ask what "best" means: smallest cost, largest score, earliest deadline, or highest priority. Once that ordering is defined, the heap gives efficient incremental selection.
        """,
        """
        Heap signals include "kth largest," "top k," "merge sorted streams," "always choose the smallest/largest available," "process tasks by priority," "hire k workers from candidate pools," and "maintain a dynamic frontier of best options." If the problem keeps asking for the next minimum or maximum after updates, think heap. If sorting would give the right first answer but the state changes after each pick, a heap is usually a stronger fit. If you hear "stream" or "online," heaps become even more likely because data arrives gradually.
        """,
        """
        First define the priority key. Then decide whether you want a min-heap, max-heap, or a fixed-size heap that retains only the k most relevant elements. Push initial candidates. Repeatedly pop the best candidate, use it, and push any newly available candidates that arise from that choice. For top-k problems, keep a heap of size k so weak elements get ejected when a better one appears. In interval or worker-selection problems, heaps are often combined with sorting or two pointers: sorting determines which candidates become eligible, and the heap decides which eligible candidate to choose next. The interview pattern is "ordering of availability by one dimension, ordering of preference by another."
        """,
        """
        Heap push and pop are O(log n) because the inserted or removed element only travels up or down the tree height. Getting the top element is O(1). Building a heap from n elements can be O(n). Many interview solutions become O(n log k) when you keep only a size-k heap, which is better than sorting all n elements when k is small. Space depends on how many candidates must remain live. The best explanation highlights why a heap is cheaper than full sorting when only a rolling best set is needed.
        """,
        """
        A common mistake is using a heap when a monotonic queue or simple running statistic would be enough, adding complexity without benefit. Another is forgetting that Python's `heapq` is a min-heap only, so max-heap behavior requires negation. Candidates also push raw values when they need tuples with tie-breakers, then cannot reconstruct which item was chosen. In two-structure problems, people sometimes fail to remove expired or ineligible heap entries, leading to stale tops. Another bug is sorting when the problem is dynamic and repeated re-sorting becomes too expensive.
        """,
        """
        Kth Largest Element in an Array can be solved with a min-heap of size k because the smallest element inside the heap is then the kth largest overall. Smallest Number in Infinite Set uses a min-heap plus a set to reinsert removed numbers and always pop the current minimum. Maximum Subsequence Score uses sorting by one array and a heap over the selected `nums1` values to maintain the best k-sum under the current minimum `nums2`. Total Cost to Hire K Workers combines two candidate pools with heaps so each hire chooses the cheapest available worker from either side. Merge k sorted lists and task scheduling are classic non-LC75 heap patterns that use the same "best next candidate" logic. Dijkstra is another major heap application when edge weights matter.
        """,
        """
        Python:
        ```python
        import heapq

        def top_k_template(nums, k):
            heap = []

            for value in nums:
                heapq.heappush(heap, value)

                # Keep only the k strongest candidates in the heap.
                if len(heap) > k:
                    heapq.heappop(heap)

            # The smallest element in the size-k heap is the kth largest overall.
            return heap[0]
        ```

        C++:
        ```cpp
        int topKTemplate(const vector<int>& nums, int k) {
            priority_queue<int, vector<int>, greater<int>> minHeap;

            for (int value : nums) {
                minHeap.push(value);

                // Keep only the k largest values seen so far.
                if ((int)minHeap.size() > k) {
                    minHeap.pop();
                }
            }

            // The heap top is the kth largest value.
            return minHeap.top();
        }
        ```
        The template changes only in the priority key and the candidate source.
        """,
    ),
    "Backtracking": build_topic(
        "Backtracking",
        """
        Backtracking is systematic search over a decision tree with undo. Internally, you build a partial solution, test whether it is still valid or promising, recurse deeper, and then revert the choice before exploring the next branch. The technique exists because some interview problems cannot be solved greedily or with a simple linear scan; they require enumerating combinations, permutations, partitions, or placements. The point of backtracking is not brute force for its own sake. It is structured brute force with aggressive pruning. Each recursive level represents one decision. Each return step restores state so the next sibling branch starts clean. Strong candidates explain backtracking in terms of state transitions and pruning, not just "try everything." If you know exactly what the current path means and exactly when a branch can be abandoned, the search becomes comprehensible and often surprisingly efficient on interview-sized constraints.
        """,
        """
        Signals include "generate all combinations," "find all subsets," "choose k numbers that sum to n," "all valid paths," "permutations," "N-Queens," and "search with constraints that are checked incrementally." If the problem asks for all valid constructions rather than one numeric optimum, backtracking is a leading candidate. Another signal is small constraints, like digits length <= 4 or numbers from 1 to 9, where exhaustive branching is feasible. Phrases like "distinct combinations," "cannot reuse," and "prune invalid partial states" are especially strong hints.
        """,
        """
        First define the decision tree. What does one recursive level choose: the next position, the next candidate number, the next letter, or the next edge? Then define the state you carry: current path, current sum, remaining candidates, used markers, or row/column constraints. At each call, check whether you have reached a complete solution. If so, record a copy. Otherwise, iterate through legal next choices, apply one choice, recurse, and then undo that choice. Add pruning early. If the running sum already exceeds target, stop. If not enough numbers remain to reach k picks, stop. Backtracking without pruning often passes only toy inputs; interview-quality backtracking is about shrinking the tree before exploring it.
        """,
        """
        Complexity is usually exponential in the branching factor and depth, because the algorithm explores a search tree. That sounds scary, but small constraints and pruning make it practical. Space is O(depth) for the recursion stack plus the current path, excluding the output. Candidates should be honest here: backtracking is expensive in the worst case. The point is that the problem constraints are designed to allow it, and careful pruning can cut huge portions of the tree. Interviewers value that realism more than pretending the method is cheap.
        """,
        """
        Common mistakes include forgetting to undo state after recursion, which corrupts sibling branches. Another is appending the current path directly to the answer list without copying it, so later edits mutate recorded results. Candidates also use global state without a clear invariant, which makes debugging impossible. A fourth mistake is skipping pruning opportunities and then blaming Python speed when the real issue is exploring obviously dead branches. Finally, off-by-one errors in the candidate loop often create duplicates or miss valid combinations.
        """,
        """
        Letter Combinations of a Phone Number uses backtracking because each digit branches into multiple letters, and the task is to enumerate every complete string. Combination Sum III uses backtracking because you must choose exactly k distinct numbers from 1 through 9 that sum to n, which is a constrained combination search with natural pruning. Subsets and permutations are classic backtracking templates even though they are not all in LC75. Word search on a grid also uses backtracking because each path extends one step at a time with visited-state undo. Palindrome partitioning uses backtracking over cut positions with a validity check on each chosen segment.
        """,
        """
        Python:
        ```python
        def backtrack_template(candidates):
            answer = []
            path = []

            def dfs(start):
                # Record a copy when the current path is a complete solution.
                answer.append(path[:])

                for i in range(start, len(candidates)):
                    # Choose.
                    path.append(candidates[i])

                    # Explore.
                    dfs(i + 1)

                    # Undo so the next branch starts clean.
                    path.pop()

            dfs(0)
            return answer
        ```

        C++:
        ```cpp
        void dfsTemplate(
            const vector<int>& candidates,
            int start,
            vector<int>& path,
            vector<vector<int>>& answer
        ) {
            // Save a snapshot of the current solution state.
            answer.push_back(path);

            for (int i = start; i < (int)candidates.size(); ++i) {
                // Choose.
                path.push_back(candidates[i]);

                // Explore.
                dfsTemplate(candidates, i + 1, path, answer);

                // Undo.
                path.pop_back();
            }
        }
        ```
        The reusable backbone is choose, explore, undo, with pruning added as early as possible.
        """,
    ),
    "Graphs (BFS/DFS)": build_topic(
        "Graphs (BFS/DFS)",
        """
        Graphs model arbitrary relationships instead of the strict hierarchy of trees. Internally, a graph is a set of vertices plus edges, often stored as an adjacency list. The key shift is that multiple paths may exist between nodes, cycles may exist, and there is usually no privileged root unless the problem gives one. Graph algorithms exist because many real problems are about connectivity, reachability, components, shortest unweighted paths, and structural dependencies. In interviews, DFS is the tool for full exploration, component discovery, and structural recursion. BFS is the tool for shortest path in unweighted graphs and wave-like expansion. The most important graph habit is to think in states and edges. A node is only half the story; the algorithm progresses by exploring legal transitions. Once you frame a problem as state graph plus traversal goal, many strange stories collapse into standard BFS or DFS.
        """,
        """
        Signals include "cities connected by roads," "can visit all rooms," "number of provinces," "reorder routes," "evaluate division as relationships," "minimum steps," "maze," "network," "connected components," and "graph given as adjacency list or matrix." If the problem is about reachability, component counting, or whether every node can be visited, think DFS or BFS. If it asks for minimum number of moves in an unweighted setting, think BFS. If relationships compose transitively, like equations or room keys, that is another graph clue. A hidden graph often appears when the original story is not literally about nodes and edges but can be modeled that way.
        """,
        """
        First decide what a node represents. Sometimes it is explicit, like a room or city. Sometimes it is an implicit state, like a cell in a maze. Build the adjacency structure if needed. For DFS, iterate through all nodes and launch a traversal whenever you find an unvisited one; that is the standard component pattern. For BFS, enqueue starting states and track distance by level or by storing step counts. Always mark visited consistently to avoid cycles. If edges are directed, pay attention to direction because connectivity changes. If the graph is weighted, stop and reconsider; BFS is no longer enough. In interview explanations, the clean sentence is "I am traversing the state graph where each edge means one legal move."
        """,
        """
        DFS and BFS over adjacency lists are O(V + E) because every vertex is processed once and every edge is examined a bounded number of times. Adjacency matrices raise the cost to O(V^2) because scanning neighbors requires checking every potential edge. Space is O(V) for the visited structure and recursion stack or queue. In grid graphs, V is the number of cells and E is proportional to V, so the result is still linear in grid size. Complexity discussions should mention the representation because matrix versus list matters a lot.
        """,
        """
        Common mistakes include forgetting a visited set in cyclic graphs, which causes infinite loops or repeated work. Another is using BFS language but writing DFS code, then claiming shortest path guarantees that no longer hold. Candidates also build edges in the wrong direction, especially in route-reversal or prerequisite-style problems. In adjacency-matrix problems, people sometimes mark visited too late and count the same component multiple times. One more subtle bug is mixing node identifiers and indices when the graph labels are not contiguous.
        """,
        """
        Keys and Rooms uses graph traversal because each room points to rooms unlocked by its keys, and the question is simple reachability from room 0. Number of Provinces uses DFS/BFS over an adjacency matrix to count connected components. Reorder Routes to Make All Paths Lead to the City Zero models directed roads and traverses an undirected view while counting edges that point away from the root. Evaluate Division builds a weighted graph where DFS or BFS multiplies edge ratios along a path. Nearest Exit from Entrance in Maze is BFS over grid cells because each move has equal cost. Rotting Oranges is multi-source BFS over a grid because all rotten sources expand simultaneously.
        """,
        """
        Python:
        ```python
        def dfs_graph(graph, start, visited):
            visited.add(start)

            for neighbor in graph[start]:
                if neighbor in visited:
                    continue
                dfs_graph(graph, neighbor, visited)
        ```

        C++:
        ```cpp
        void dfsGraph(
            const vector<vector<int>>& graph,
            int node,
            vector<bool>& visited
        ) {
            visited[node] = true;

            for (int neighbor : graph[node]) {
                if (visited[neighbor]) {
                    continue;
                }
                dfsGraph(graph, neighbor, visited);
            }
        }
        ```
        Switch to BFS when the problem asks for minimum unweighted distance rather than plain exploration.
        """,
    ),
    "Dynamic Programming (1D and 2D)": build_topic(
        "Dynamic Programming (1D and 2D)",
        """
        Dynamic programming is the method of solving a problem by breaking it into overlapping subproblems, solving each subproblem once, and reusing those results. Internally, the core idea is state definition. A DP table or memo stores the answer to a precisely described smaller question so larger questions can be assembled from it. DP exists because naive recursion often recomputes the same substructures exponentially many times. In interviews, DP becomes much less mysterious when you ask four questions: what is the state, what transition moves between states, what are the base cases, and what order makes dependencies available? 1D DP usually handles linear progression such as houses, stairs, or sequences. 2D DP usually handles interactions between two indices, two strings, or grid positions. The "dynamic" part is not movement; it is reusing solved states instead of rebuilding them.
        """,
        """
        DP signals include "maximum/minimum ways to reach," "longest subsequence," "edit distance," "can partition," "count arrangements," "choose or skip," and "optimal answer depends on smaller prefixes." If brute force naturally branches into many repeated calls with the same parameters, that is a strong DP sign. Phrases like "from i onward," "first j characters," "up to this position," and "best score ending here" often map directly to state definitions. When greedy choices look tempting but hard to prove, DP is worth checking because it can explicitly compare alternatives.
        """,
        """
        First define the state in plain English. For House Robber, `dp[i]` can mean the best money from the first i houses. For Longest Common Subsequence, `dp[i][j]` can mean the answer for prefixes ending at i and j. Then write the transition: how does the current state relate to previous states? Often it is choose/skip, match/mismatch, or coming from top/left/diagonal. Initialize base cases carefully because a wrong zero row or zero column ruins the whole table. Decide top-down memoization or bottom-up tabulation. In interviews, bottom-up is often easier to analyze, while top-down is often easier to derive. Finally, look for rolling-array or scalar optimization if the state only depends on nearby earlier entries.
        """,
        """
        Time is usually the number of states times the cost per transition. Space is the number of stored states, unless optimized. A 1D DP with n states and O(1) transition cost is O(n). A 2D DP over two strings of lengths m and n is often O(mn). Complexity explanation should tie directly to the state definition. If you cannot count states cleanly, the DP formulation is probably not yet sharp enough. Good candidates also point out when only the previous row or previous two states are needed, dropping space from O(n) or O(mn) to O(1) or O(n).
        """,
        """
        Common mistakes include defining the state vaguely, then writing transitions that mix incompatible meanings. Another is skipping base-case reasoning and trying to repair index errors later. Candidates also overuse DP when greedy or simple scanning is sufficient, which makes solutions slower and harder to explain. In 2D DP, off-by-one indexing around empty prefixes is a classic source of bugs. Finally, people sometimes memoize recursive code but still mutate shared objects, accidentally invalidating the assumption that a state's answer is fixed.
        """,
        """
        N-th Tribonacci Number is simple 1D DP because each state depends on the previous three values. Min Cost Climbing Stairs uses 1D DP where each step cost depends on the cheaper of the previous one-step or two-step path. House Robber is choose-or-skip 1D DP: rob current plus `dp[i-2]` or skip current and keep `dp[i-1]`. Domino and Tromino Tiling is a more advanced recurrence with multiple structural states. Unique Paths is 2D DP on a grid because each cell inherits from top and left. Longest Common Subsequence and Edit Distance are classic 2D DP over string prefixes. Best Time to Buy and Sell Stock with Transaction Fee can be expressed as DP over hold/cash states even though greedy intuition also helps.
        """,
        """
        Python:
        ```python
        def one_d_dp(nums):
            if not nums:
                return 0

            dp = [0] * len(nums)
            dp[0] = nums[0]

            for i in range(1, len(nums)):
                take = nums[i] + (dp[i - 2] if i > 1 else 0)
                skip = dp[i - 1]
                dp[i] = max(take, skip)

            return dp[-1]
        ```

        C++:
        ```cpp
        int oneDDp(const vector<int>& nums) {
            if (nums.empty()) {
                return 0;
            }

            vector<int> dp(nums.size(), 0);
            dp[0] = nums[0];

            for (int i = 1; i < (int)nums.size(); ++i) {
                int take = nums[i] + (i > 1 ? dp[i - 2] : 0);
                int skip = dp[i - 1];
                dp[i] = max(take, skip);
            }

            return dp.back();
        }
        ```
        The reusable lesson is to define the subproblem so transitions become obvious and local.
        """,
    ),
    "Greedy": build_topic(
        "Greedy",
        """
        Greedy algorithms make the best local choice available at each step, with the claim that this leads to a globally optimal result. The technique exists because some problem structures have an exchange argument: if an optimal solution makes a different early choice, you can swap in the greedy choice without harming optimality. In interviews, greedy is powerful but dangerous. It often produces elegantly short solutions, yet it is easy to fool yourself with a heuristic that feels good but is not provably correct. Strong candidates do not just say "pick the maximum" or "pick the earliest ending interval." They explain the invariant or exchange argument that makes the local choice safe. Greedy is often paired with sorting because order reveals which local decisions are dominant and which future options they preserve.
        """,
        """
        Greedy signals include "minimum number," "maximum number," "pick intervals without overlap," "always choose the earliest finishing," "can place flowers," "erase minimum intervals," "burst balloons with minimum arrows," and "rearrange under simple local constraints." If the problem asks for an optimum but the state seems to collapse cleanly after each choice rather than branching recursively, greedy is worth testing. Sorting by one key and scanning once is a very common sign. Also watch for problems where one choice clearly preserves more future flexibility than another.
        """,
        """
        Start by asking what local decision seems most powerful and how to justify it. Often you sort first so candidates are considered in the right order. Then maintain a compact invariant such as the smallest possible ending time of chosen intervals, the farthest reachable position, or the best value seen so far. At each step, choose the option that preserves optimal future possibilities: smallest end time for interval scheduling, smallest adequate resource usage, or immediate placement only when it cannot harm later placements. If you cannot articulate why a local choice is safe, stop and consider DP instead. Greedy coding is easy; greedy proof is the real task.
        """,
        """
        Greedy solutions are often O(n log n) because sorting dominates, followed by an O(n) scan. Some are pure O(n) if the data is already in the right order. Space is usually O(1) or O(n) depending on whether sorting is in place and whether helper structures are needed. Complexity is rarely the issue with greedy; correctness is. Interviewers often care more about whether you can defend the local choice than whether you can state the runtime.
        """,
        """
        Common mistakes include choosing a plausible heuristic with no proof, such as "always take the biggest number now" when future interactions matter. Another is sorting by the wrong key; interval problems often need end times, not start times. Candidates also forget that greedy frequently depends on stable invariants after sorting, so mutating state carelessly can invalidate the logic. In some array problems, people apply greedy where negative numbers or non-monotonic interactions break the local-choice assumption. Finally, they sometimes stop after finding one valid solution when the problem asks for an optimal one.
        """,
        """
        Can Place Flowers is greedy because planting at the earliest safe plot never reduces future options; it only increases progress. Increasing Triplet Subsequence uses a greedy maintenance idea by keeping the smallest first and second values possible, maximizing the chance of completing a triplet later. Non-overlapping Intervals is greedy after sorting by end time because keeping the interval that ends earliest preserves the most room for the future. Minimum Number of Arrows to Burst Balloons uses a very similar earliest-end insight. Best Time to Buy and Sell Stock with Transaction Fee has a greedy-flavored DP interpretation where you maintain effective buy cost and realized profit. Dota2 Senate has a queue simulation, not a greedy proof, and distinguishing that is important.
        """,
        """
        Python:
        ```python
        def interval_greedy(intervals):
            intervals.sort(key=lambda interval: interval[1])
            chosen = 0
            current_end = float("-inf")

            for start, end in intervals:
                # Take the interval only if it does not conflict with the last choice.
                if start >= current_end:
                    chosen += 1
                    current_end = end

            return chosen
        ```

        C++:
        ```cpp
        int intervalGreedy(vector<vector<int>>& intervals) {
            sort(intervals.begin(), intervals.end(),
                 [](const auto& a, const auto& b) { return a[1] < b[1]; });

            int chosen = 0;
            int currentEnd = INT_MIN;

            for (const auto& interval : intervals) {
                // Choose the interval if it starts after the previous chosen end.
                if (interval[0] >= currentEnd) {
                    ++chosen;
                    currentEnd = interval[1];
                }
            }

            return chosen;
        }
        ```
        The reusable greedy question is always: what local choice preserves the most future freedom?
        """,
    ),
    "Intervals": build_topic(
        "Intervals",
        """
        Interval problems deal with ranges on a line, usually represented as [start, end]. Internally, the challenge is reasoning about overlap, containment, mergeability, and ordering. Intervals exist as a problem category because many scheduling, resource allocation, and timeline questions reduce to events occupying ranges. In interviews, intervals are less about one specific data structure and more about sorting plus careful overlap logic. Once sorted, many interval problems become linear scans because the relative order of starts or ends captures all important interactions. The core question is usually one of four: do intervals overlap, how do I merge them, how many can I keep, or how many resources/arrows/rooms do I need to cover them? Candidates should define overlap precisely, because inclusive versus exclusive boundaries changes everything.
        """,
        """
        Signals include "interval," "meeting times," "ranges," "balloons," "merge overlapping," "erase overlaps," "schedule as many as possible," and "minimum arrows/rooms/resources." Even if the problem statement uses story language like balloons on the x-axis or jobs with start/end times, it is still an interval problem. If every item has a start and end and interactions depend only on whether ranges intersect, sort and scan is the first reflex. Another signal is that the input can be drawn on a number line.
        """,
        """
        First decide which ordering exposes the needed structure. Merge problems usually sort by start time. Keep-maximum or remove-minimum problems often sort by end time because earlier finishing intervals preserve future room. Then scan from left to right while maintaining a compact summary of the active merged interval or the end of the last chosen interval. When a new interval overlaps the current one, either merge them, discard one of them, or count a resource interaction depending on the goal. When it does not overlap, finalize the current segment and move on. The crucial interview habit is to define overlap before writing code: are touching endpoints overlapping or not?
        """,
        """
        Sorting dominates many interval solutions, giving O(n log n) time, followed by O(n) scanning. Space is O(1) extra if sorting can be done in place and only a few scalars are needed, or O(n) if you build a merged result list. Complexity is usually straightforward; correctness hinges more on the ordering key and overlap definition than on asymptotics.
        """,
        """
        A common mistake is sorting by start time when the greedy proof needs end time, especially in removal and selection problems. Another is merging based on the wrong overlap rule, such as treating touching endpoints inconsistently. Candidates also forget to update the running end correctly during an overlap, which breaks merged ranges. In keep-one-discard-one problems, people sometimes discard the shorter interval instead of the one with the later end, losing future flexibility. Finally, they often forget to flush the last active interval after the loop.
        """,
        """
        Non-overlapping Intervals is the classic "remove minimum" problem solved greedily by sorting by end time and keeping the interval that finishes earliest. Minimum Number of Arrows to Burst Balloons is nearly the same structure: each arrow can cover an overlap group, and choosing the smallest possible end keeps that arrow usable for as many balloons as possible. Merge Intervals uses start-time sorting and a running merged segment. Insert Interval combines placement and merge logic. Meeting Rooms asks whether overlaps exist or how many concurrent intervals are active. Employee free time and interval intersection are natural extensions of the same scan principles.
        """,
        """
        Python:
        ```python
        def merge_intervals(intervals):
            intervals.sort(key=lambda interval: interval[0])
            merged = []

            for start, end in intervals:
                if not merged or merged[-1][1] < start:
                    # No overlap: start a new merged interval.
                    merged.append([start, end])
                else:
                    # Overlap: extend the current merged interval.
                    merged[-1][1] = max(merged[-1][1], end)

            return merged
        ```

        C++:
        ```cpp
        vector<vector<int>> mergeIntervals(vector<vector<int>>& intervals) {
            sort(intervals.begin(), intervals.end());
            vector<vector<int>> merged;

            for (const auto& interval : intervals) {
                if (merged.empty() || merged.back()[1] < interval[0]) {
                    // No overlap: begin a new block.
                    merged.push_back(interval);
                } else {
                    // Overlap: extend the existing merged block.
                    merged.back()[1] = max(merged.back()[1], interval[1]);
                }
            }

            return merged;
        }
        ```
        Most interval interviews reduce to picking the right sort key and then maintaining one meaningful running summary.
        """,
    ),
    "Bit Manipulation": build_topic(
        "Bit Manipulation",
        """
        Bit manipulation works directly on the binary representation of integers. Internally, every integer is a sequence of bits, and bitwise operators let you inspect, clear, set, toggle, or combine those bits without looping over decimal logic. The technique exists because some problems depend on per-bit structure rather than on arithmetic magnitude. In interviews, bits show up in uniqueness problems, subset encoding, parity checks, mask-based state compression, and logic identities. The most useful conceptual step is to stop seeing numbers as whole values and start seeing them as bundles of independent yes/no features. XOR, AND, OR, shifts, and masks are the building blocks. Many candidates memorize tricks like `x & (x - 1)` without understanding why they work. A better approach is to reason from binary patterns, because then the tricks become obvious and reusable.
        """,
        """
        Signals include "every element appears twice except one," "count set bits," "minimum flips so a OR b equals c," "power of two," "subset mask," and "optimize by using bits rather than arrays." If the story mentions binary, parity, toggling flags, or exact appearance counts of small multiplicity, bit manipulation is likely relevant. Another signal is when boolean state over a small universe can be packed into an integer mask. If arithmetic solutions feel clumsy but per-position binary reasoning seems independent, bits are worth considering immediately.
        """,
        """
        First ask what each bit position means. Is it an independent flag, a contribution to XOR cancellation, or a place where a logical condition must be satisfied? Then choose the operator that matches the behavior. XOR is perfect for cancellation because identical bits annihilate each other. AND isolates shared set bits or checks whether a specific bit is present. OR combines enabled bits. Left and right shifts move positions or divide/multiply by powers of two under the right assumptions. For mask problems, iterate through bit positions and decide what must happen at each one. In interviews, narrating one bit position carefully often convinces the listener that the whole algorithm is correct.
        """,
        """
        Bit operations themselves are O(1) on fixed-width machine integers. Loops over all bit positions are O(word_size), effectively constant for 32-bit or 64-bit integers, though still often described as O(1) or O(32). Space is usually O(1). The more interesting complexity discussion is when bit masks represent subsets; then iterating over all masks is O(2^n), which is only feasible for small n. Candidates should distinguish between cheap bitwise primitives and exponential mask enumeration.
        """,
        """
        Common mistakes include using signed shifts carelessly in C++ when sign extension changes behavior. Another is applying XOR tricks when the multiplicity pattern does not actually match the trick's assumptions. Candidates also confuse `|` and `^`, especially in "flip bits" problems where the difference matters completely. In mask code, off-by-one errors on bit positions are common. Finally, people use bit manipulation where a hashmap is clearer and just as fast, which hurts explanation quality more than it helps cleverness.
        """,
        """
        Counting Bits uses the recurrence based on halving or clearing the lowest set bit, because binary structure directly reuses smaller answers. Single Number uses XOR because equal numbers cancel, leaving only the unique value. Minimum Flips to Make a OR b Equal to c is naturally solved bit by bit by comparing the required result at each position. Power of Two uses the property that powers of two have exactly one set bit, so `n & (n - 1)` becomes zero. Subset generation via masks is a broader pattern where each bit says whether an element is included. Maximum XOR and trie-based bit problems are advanced extensions of the same binary reasoning mindset.
        """,
        """
        Python:
        ```python
        def single_number(nums):
            result = 0

            for value in nums:
                # Equal values cancel each other under XOR.
                result ^= value

            return result
        ```

        C++:
        ```cpp
        int singleNumber(const vector<int>& nums) {
            int result = 0;

            for (int value : nums) {
                // XOR cancels duplicates and preserves the unpaired value.
                result ^= value;
            }

            return result;
        }
        ```
        The reusable lesson is to assign a meaning to each bit position first, then let the operator follow from that meaning.
        """,
    ),
}


def split_topic_into_chunks(text: str) -> list[str]:
    words = text.split()
    chunks = []
    start = 0

    while start < len(words):
        end = min(start + TOPIC_TARGET_WORDS, len(words))
        chunks.append(" ".join(words[start:end]))
        if end == len(words):
            break
        start = end - TOPIC_OVERLAP_WORDS

    return chunks


def post_ingest(text: str, metadata: dict) -> None:
    payload = json.dumps({"text": text, "metadata": metadata}).encode("utf-8")
    req = request.Request(
        INGEST_URL,
        data=payload,
        headers={"Content-Type": "application/json"},
        method="POST",
    )

    try:
        with request.urlopen(req) as response:
            if response.status not in (200, 201):
                raise RuntimeError(f"Unexpected status code: {response.status}")
    except error.HTTPError as exc:
        body = exc.read().decode("utf-8", errors="ignore")
        raise RuntimeError(
            f"Failed to ingest chunk. Status={exc.code}, body={body}"
        ) from exc
    except error.URLError as exc:
        raise RuntimeError(
            "Could not reach rag-service at http://localhost:8000. "
            "Start the FastAPI app before running ingestion."
        ) from exc


def format_example(example: dict) -> str:
    return json.dumps(example, indent=2)


def generate_problem_explanation(question: dict) -> str:
    from google import genai

    genai_client = genai.Client(api_key=GEMINI_API_KEY)
    prompt = dedent(
        f"""
        You are writing high quality RAG study content for DSA interview prep.
        Produce a single detailed chunk for this LeetCode-style problem.
        Be specific, practical, and educational. Do not be brief.

        Problem title: {question["title"]}
        Difficulty: {question["difficulty"]}
        Tags: {", ".join(question.get("tags", []))}
        Description: {question["description"]}
        Input format: {question.get("inputFormat", "")}
        Output format: {question.get("outputFormat", "")}
        First example: {format_example(question["examples"][0]) if question.get("examples") else "N/A"}

        Output exactly in this structure:

        PROBLEM: {question["title"]}
        DIFFICULTY: {question["difficulty"]}
        TAGS: {", ".join(question.get("tags", []))}
        DESCRIPTION: {question["description"]}
        INPUT FORMAT: {question.get("inputFormat", "")}
        OUTPUT FORMAT: {question.get("outputFormat", "")}
        EXAMPLE: {format_example(question["examples"][0]) if question.get("examples") else "N/A"}

        APPROACH: Explain the optimal approach step by step, the key insight, and why it works. Write as if teaching someone stuck on the problem. Include time and space complexity.

        BRUTE FORCE: Describe the naive O(n^2) or worse approach and why it fails.

        OPTIMAL SOLUTION IN PYTHON:
        Write a complete working Python solution. Add detailed comments on every meaningful line explaining what and why.

        OPTIMAL SOLUTION IN C++:
        Write a complete working C++ solution. Add detailed comments on every meaningful line explaining what and why.

        COMMON MISTAKES: Explain the wrong approaches people try first and the edge cases they miss.

        Requirements:
        - Prefer the optimal standard interview solution.
        - Use the problem statement exactly; do not invent alternate input formats.
        - Keep the explanation technically precise.
        - If the problem has multiple valid optimal approaches, choose the one most teachable for interviews.
        """
    ).strip()

    response = genai_client.models.generate_content(
        model=LLM_MODEL,
        contents=prompt,
    )
    return response.text or ""


def ingest_topics() -> int:
    total = 0

    for topic, text in TOPIC_CONTENT.items():
        chunks = split_topic_into_chunks(text)
        total_chunks = len(chunks)

        for index, chunk in enumerate(chunks, start=1):
            print(f"Ingesting {topic} chunk {index}/{total_chunks}...")
            post_ingest(
                chunk,
                {
                    "source": "dsa_topic",
                    "topic": topic,
                    "chunk_index": index,
                    "total_chunks": total_chunks,
                    "type": "topic",
                    "pre_chunked": True,
                },
            )
            total += 1
            time.sleep(REQUEST_DELAY_SECONDS)

    return total


def load_questions() -> list[dict]:
    return json.loads(QUESTIONS_PATH.read_text(encoding="utf-8"))


def ingest_questions() -> int:
    total = 0
    questions = load_questions()
    questions = questions[68+0:]  

    for index, question in enumerate(questions, start=1):
        print(f"Generating LC75 explanation {index}/{len(questions)}: {question['title']}...")
        chunk_text = generate_problem_explanation(question)

        if not chunk_text.strip():
            raise RuntimeError(f"No generated content for question {question['title']}")

        print(f"Ingesting {question['title']} chunk 1/1...")
        post_ingest(
            chunk_text,
            {
                "source": "lc75",
                "questionId": question["questionId"],
                "questionTitle": question["title"],
                "title": question["title"],
                "difficulty": question["difficulty"],
                "tags": question.get("tags", []),
                "type": "problem",
                "pre_chunked": True,
            },
        )
        total += 1
        time.sleep(REQUEST_DELAY_SECONDS)

    return total


def main() -> None:
    if not QUESTIONS_PATH.exists():
        raise FileNotFoundError(f"Could not find questions file: {QUESTIONS_PATH}")

    total_chunks = 0
    #total_chunks += ingest_topics()
    total_chunks += ingest_questions()
    print(f"Total chunks ingested: {total_chunks}")


if __name__ == "__main__":
    main()

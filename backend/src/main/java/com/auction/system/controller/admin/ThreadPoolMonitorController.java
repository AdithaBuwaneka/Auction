package com.auction.system.controller.admin;

import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.concurrent.ThreadPoolTaskExecutor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.lang.management.ManagementFactory;
import java.lang.management.ThreadMXBean;
import java.util.*;

/**
 * Thread Pool Monitor Controller
 * Admin endpoints for monitoring thread pool activity
 * Member 2's Feature
 */
@Tag(name = "10. Thread Pool Monitoring (Member 2)", description = "Monitor thread pool statistics and concurrency metrics")
@RestController
@RequestMapping("/api/admin/threads")
@Slf4j
@CrossOrigin(origins = "*")
public class ThreadPoolMonitorController {

    // Optional: Use system thread monitoring instead of specific ThreadPoolTaskExecutor
    // to avoid bean conflicts with WebSocket executors
    private ThreadPoolTaskExecutor threadPoolTaskExecutor = null;

    /**
     * Get thread pool status
     * GET /api/admin/threads/pool
     */
    @GetMapping("/pool")
    @PreAuthorize("hasRole('ADMIN')")
    public Map<String, Object> getThreadPoolStatus() {
        log.info("Admin: Get thread pool status");

        Map<String, Object> status = new HashMap<>();

        if (threadPoolTaskExecutor != null) {
            status.put("corePoolSize", threadPoolTaskExecutor.getCorePoolSize());
            status.put("maxPoolSize", threadPoolTaskExecutor.getMaxPoolSize());
            status.put("activeThreads", threadPoolTaskExecutor.getActiveCount());
            status.put("poolSize", threadPoolTaskExecutor.getPoolSize());
            status.put("queueSize", threadPoolTaskExecutor.getThreadPoolExecutor().getQueue().size());
            status.put("queueCapacity", threadPoolTaskExecutor.getThreadPoolExecutor().getQueue().remainingCapacity());
            status.put("completedTasks", threadPoolTaskExecutor.getThreadPoolExecutor().getCompletedTaskCount());
            status.put("totalTasks", threadPoolTaskExecutor.getThreadPoolExecutor().getTaskCount());
        } else {
            // Get system thread info
            ThreadMXBean threadMXBean = ManagementFactory.getThreadMXBean();
            status.put("systemThreadCount", threadMXBean.getThreadCount());
            status.put("peakThreadCount", threadMXBean.getPeakThreadCount());
            status.put("daemonThreadCount", threadMXBean.getDaemonThreadCount());
            status.put("totalStartedThreadCount", threadMXBean.getTotalStartedThreadCount());
        }

        status.put("timestamp", System.currentTimeMillis());
        return status;
    }

    /**
     * Get active threads
     * GET /api/admin/threads/active
     */
    @GetMapping("/active")
    @PreAuthorize("hasRole('ADMIN')")
    public Map<String, Object> getActiveThreads() {
        log.info("Admin: Get active threads");

        ThreadMXBean threadMXBean = ManagementFactory.getThreadMXBean();
        long[] threadIds = threadMXBean.getAllThreadIds();

        List<Map<String, Object>> threads = new ArrayList<>();

        for (long threadId : threadIds) {
            java.lang.management.ThreadInfo threadInfo = threadMXBean.getThreadInfo(threadId);
            if (threadInfo != null) {
                Map<String, Object> thread = new HashMap<>();
                thread.put("id", threadInfo.getThreadId());
                thread.put("name", threadInfo.getThreadName());
                thread.put("state", threadInfo.getThreadState().toString());
                thread.put("cpuTime", threadMXBean.getThreadCpuTime(threadId));

                // Only include active/runnable threads
                if (threadInfo.getThreadState() == Thread.State.RUNNABLE ||
                    threadInfo.getThreadState() == Thread.State.TIMED_WAITING) {
                    threads.add(thread);
                }
            }
        }

        Map<String, Object> response = new HashMap<>();
        response.put("activeThreads", threads);
        response.put("count", threads.size());
        response.put("totalThreads", threadIds.length);

        return response;
    }

    /**
     * Get thread pool stats
     * GET /api/admin/threads/stats
     */
    @GetMapping("/stats")
    @PreAuthorize("hasRole('ADMIN')")
    public Map<String, Object> getThreadStats() {
        log.info("Admin: Get thread stats");

        ThreadMXBean threadMXBean = ManagementFactory.getThreadMXBean();

        Map<String, Object> stats = new HashMap<>();
        stats.put("currentThreadCount", threadMXBean.getThreadCount());
        stats.put("peakThreadCount", threadMXBean.getPeakThreadCount());
        stats.put("daemonThreadCount", threadMXBean.getDaemonThreadCount());
        stats.put("totalStartedThreadCount", threadMXBean.getTotalStartedThreadCount());

        // Thread states count
        Map<String, Integer> stateCount = new HashMap<>();
        long[] threadIds = threadMXBean.getAllThreadIds();

        for (long threadId : threadIds) {
            java.lang.management.ThreadInfo threadInfo = threadMXBean.getThreadInfo(threadId);
            if (threadInfo != null) {
                String state = threadInfo.getThreadState().toString();
                stateCount.put(state, stateCount.getOrDefault(state, 0) + 1);
            }
        }

        stats.put("threadsByState", stateCount);

        if (threadPoolTaskExecutor != null) {
            stats.put("poolActiveCount", threadPoolTaskExecutor.getActiveCount());
            stats.put("poolCompletedTasks", threadPoolTaskExecutor.getThreadPoolExecutor().getCompletedTaskCount());
        }

        return stats;
    }
}

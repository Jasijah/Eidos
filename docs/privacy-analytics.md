# Privacy and Analytics

Anonymous analytics are disabled by default and stored locally. Enabling analytics records event names, timestamps, anonymous session IDs, and bounded product properties. It does not record raw audio, raw video, conversation text, uploaded image pixels, names, email addresses, or voice identity.

Crash reports and performance samples remain local and require manual export. Diagnostic exports can include OS, Electron/Chrome version, GPU label, renderer information, memory, FPS, render latency, MediaPipe latency, and stack traces. Users choose whether to export them.

Closed-beta signup details are personally identifiable and are stored separately from anonymous product analytics. They must not be silently joined. No automatic upload exists in this sprint.
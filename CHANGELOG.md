# Changelog

## [1.20.5]

### Fixed

- A download no longer reaches the cache before it is checked. A non-2xx response (a 404 page) was briefly at the cache path as a finished-looking file until it was removed; it now never leaves its staging file. A cached npm tarball that is empty is fetched again instead of being trusted.
- A source tarball that fails its published sha256 is fetched again once, then reported, and is no longer left in the cache (it was validated but not removed).

- An install path that is a file or a link of any kind, or a folder this tool cannot read, is never removed or replaced: the install fails with an error naming the path.
- An install folder is complete only when it holds a node binary. A path that is missing or an empty folder is built into; a folder without a node binary that has other content is never removed or built over, and the install fails with an error naming the path.

### Changed

- An existing install path that holds other content and no node binary used to be returned as installed; it now fails with an error naming the path. An empty folder there is installed into.
- `staged-cache` is required at `^0.1.1`.
- Downloads and installs go through `staged-cache`, which replaces the hand-written staging, rename-race and checksum code.
- The log line after a failed node checksum no longer shows the sha256 of the received file, only the expected one, and the success line for npm no longer shows a checksum: npm publishes no sha256 for its tarballs, and `staged-cache` reports a match, not a digest.
- `on-one` is no longer a dependency (it was only used to read files for hashing).

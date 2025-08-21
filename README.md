# BitcoinHorizon - Vite Debug Instructions

This document provides instructions on how to run Vite with debug mode enabled for the BitcoinHorizon project.

## Available Debug Scripts

The following npm scripts have been added to enable debugging for Vite:

1. **Full Debug Mode (Development)**:
   ```bash
   npm run dev:debug
   ```
   This enables all Vite debug logs by setting `DEBUG=vite:*` during development.

2. **HMR Debug Mode**:
   ```bash
   npm run dev:debug-hmr
   ```
   This focuses on debugging the Hot Module Replacement system, which is useful for troubleshooting issues with live
   updates during development.

3. **Dependencies Debug Mode**:
   ```bash
   npm run dev:debug-deps
   ```
   This focuses on debugging dependency resolution, which is helpful when there are issues with imports or packages.

4. **Build Debug Mode**:
   ```bash
   npm run build:debug
   ```
   This enables all Vite debug logs during the build process, which is useful for troubleshooting build issues.

5. **Preview Debug Mode**:
   ```bash
   npm run preview:debug
   ```
   This enables all Vite debug logs when previewing the production build locally, which is useful for troubleshooting
   issues with the preview server.

6. **Force Cache Clear Debug Modes**:
   ```bash
   npm run dev:debug-force
   npm run build:debug-force
   ```
   These scripts enable debug mode and add the `--force` flag to clear Vite's cache. This is particularly useful when
   you suspect caching issues are causing problems.

## Understanding Debug Output

When running Vite in debug mode, you'll see additional console output with detailed information about Vite's internal
processes. This can help identify issues with:

- Module resolution
- Plugin execution
- HMR updates
- Server configuration
- Build processes

## Filtering Debug Output

If you need more specific debugging, you can create custom debug scripts by modifying the `DEBUG` environment variable.
For example:

```
"dev:debug-custom": "DEBUG=vite:resolver,vite:hmr vite"
```

This would show debug logs only for the resolver and HMR systems.

## Common Debug Patterns

- `vite:hmr` - Hot Module Replacement logs
- `vite:deps` - Dependency pre-bundling logs
- `vite:resolver` - Module resolution logs
- `vite:transform` - Transformation logs
- `vite:load` - Module loading logs
- `vite:plugin-*` - Plugin-specific logs

## Additional Debugging Tips

### General Debugging

1. You can combine Vite's debug mode with browser DevTools for frontend debugging.
2. Check the Network tab in DevTools to see if all assets are loading correctly.
3. Look for errors in the browser console that might indicate issues with your code.
4. Use the scripts with the `--force` flag to clear Vite's cache when troubleshooting.

### Common Issues and Solutions

1. **Module Resolution Issues**:
    - Look for `vite:resolver` logs to see how Vite is resolving your imports
    - Check for path issues or missing dependencies
    - Verify your import statements match the actual file paths

2. **HMR Issues**:
    - Use `npm run dev:debug-hmr` to focus on HMR-related logs
    - Check for errors in the browser console related to WebSocket connections
    - Verify that your components are properly set up for HMR

3. **Build Issues**:
    - Use `npm run build:debug` to see detailed build logs
    - Look for warnings about large chunks or optimization issues
    - Check for errors related to code splitting or asset processing

4. **Dependency Issues**:
    - Use `npm run dev:debug-deps` to focus on dependency pre-bundling
    - Check for version conflicts or missing peer dependencies
    - Verify that all dependencies are properly installed

### Interpreting Debug Output

The debug output follows this general pattern:

```
[timestamp] [debug namespace] [message]
```

For example:

```
[12:34:56.789] vite:hmr update /src/components/App.js
```

This indicates that the HMR system is updating the App.js file.

### Redirecting Debug Output to a File

If the debug output is too verbose, you can redirect it to a file for easier analysis:

```bash
npm run dev:debug > vite-debug.log 2>&1
```

This will save all debug output to a file named `vite-debug.log` that you can examine later.

import type { DeepPath, FormPath, PathInput, PathKey } from "./types.ts";

export function pathToKey(path: PathInput): DeepPath {
  return typeof path === "string" ? path : segmentsToPath(path);
}

export function normalizePath(path: PathInput): DeepPath {
  return pathToKey(path);
}

export function joinPath(base: DeepPath, segment: PathKey): DeepPath {
  if (typeof segment === "number") {
    return `${base}[${segment}]`;
  }

  return base ? `${base}.${segment}` : segment;
}

export function pathToSegments(path: PathInput): FormPath {
  if (Array.isArray(path)) {
    return path;
  }

  if (path === "") {
    return [];
  }

  return parseDeepPath(path as DeepPath);
}

export function touchedPath(path: DeepPath): DeepPath {
  return path === "" ? "$" : path;
}

function segmentsToPath(path: FormPath): DeepPath {
  return path.reduce<DeepPath>((result, segment) => joinPath(result, segment), "");
}

function parseDeepPath(path: DeepPath): FormPath {
  const segments: PathKey[] = [];
  let current = "";

  for (let index = 0; index < path.length; index += 1) {
    const char = path[index];

    if (char === ".") {
      if (current) {
        segments.push(current);
        current = "";
      }
      continue;
    }

    if (char === "[") {
      if (current) {
        segments.push(current);
        current = "";
      }

      const closing = path.indexOf("]", index);
      const token = path.slice(index + 1, closing);
      segments.push(/^\d+$/.test(token) ? Number(token) : token);
      index = closing;
      continue;
    }

    current += char;
  }

  if (current) {
    segments.push(current);
  }

  return segments;
}

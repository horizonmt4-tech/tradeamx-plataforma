// vite.config.js
import path3 from "node:path";
import react from "file:///C:/Users/Jazmin%20Reyes%20Gris/Proyecto/proyectos/Tradeamx-plataforma/node_modules/@vitejs/plugin-react/dist/index.js";
import { createLogger, defineConfig } from "file:///C:/Users/Jazmin%20Reyes%20Gris/Proyecto/proyectos/Tradeamx-plataforma/node_modules/vite/dist/node/index.js";
import { VitePWA } from "file:///C:/Users/Jazmin%20Reyes%20Gris/Proyecto/proyectos/Tradeamx-plataforma/node_modules/vite-plugin-pwa/dist/index.js";

// plugins/visual-editor/vite-plugin-react-inline-editor.js
import path2 from "path";
import { parse as parse2 } from "file:///C:/Users/Jazmin%20Reyes%20Gris/Proyecto/proyectos/Tradeamx-plataforma/node_modules/@babel/parser/lib/index.js";
import traverseBabel2 from "file:///C:/Users/Jazmin%20Reyes%20Gris/Proyecto/proyectos/Tradeamx-plataforma/node_modules/@babel/traverse/lib/index.js";
import * as t from "file:///C:/Users/Jazmin%20Reyes%20Gris/Proyecto/proyectos/Tradeamx-plataforma/node_modules/@babel/types/lib/index.js";
import fs2 from "fs";

// plugins/utils/ast-utils.js
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import generate from "file:///C:/Users/Jazmin%20Reyes%20Gris/Proyecto/proyectos/Tradeamx-plataforma/node_modules/@babel/generator/lib/index.js";
import { parse } from "file:///C:/Users/Jazmin%20Reyes%20Gris/Proyecto/proyectos/Tradeamx-plataforma/node_modules/@babel/parser/lib/index.js";
import traverseBabel from "file:///C:/Users/Jazmin%20Reyes%20Gris/Proyecto/proyectos/Tradeamx-plataforma/node_modules/@babel/traverse/lib/index.js";
import {
  isJSXIdentifier,
  isJSXMemberExpression
} from "file:///C:/Users/Jazmin%20Reyes%20Gris/Proyecto/proyectos/Tradeamx-plataforma/node_modules/@babel/types/lib/index.js";
var __vite_injected_original_import_meta_url = "file:///C:/Users/Jazmin%20Reyes%20Gris/Proyecto/proyectos/Tradeamx-plataforma/plugins/utils/ast-utils.js";
var __filename = fileURLToPath(__vite_injected_original_import_meta_url);
var __dirname2 = path.dirname(__filename);
var VITE_PROJECT_ROOT = path.resolve(__dirname2, "../..");
function validateFilePath(filePath) {
  if (!filePath) {
    return { isValid: false, error: "Missing filePath" };
  }
  const absoluteFilePath = path.resolve(VITE_PROJECT_ROOT, filePath);
  if (filePath.includes("..") || !absoluteFilePath.startsWith(VITE_PROJECT_ROOT) || absoluteFilePath.includes("node_modules")) {
    return { isValid: false, error: "Invalid path" };
  }
  if (!fs.existsSync(absoluteFilePath)) {
    return { isValid: false, error: "File not found" };
  }
  return { isValid: true, absolutePath: absoluteFilePath };
}
function parseFileToAST(absoluteFilePath) {
  const content = fs.readFileSync(absoluteFilePath, "utf-8");
  return parse(content, {
    sourceType: "module",
    plugins: ["jsx", "typescript"],
    errorRecovery: true
  });
}
function findJSXElementAtPosition(ast, line, column) {
  let targetNodePath = null;
  let closestNodePath = null;
  let closestDistance = Infinity;
  const allNodesOnLine = [];
  const visitor = {
    JSXOpeningElement(path4) {
      const node = path4.node;
      if (node.loc) {
        if (node.loc.start.line === line && Math.abs(node.loc.start.column - column) <= 1) {
          targetNodePath = path4;
          path4.stop();
          return;
        }
        if (node.loc.start.line === line) {
          allNodesOnLine.push({
            path: path4,
            column: node.loc.start.column,
            distance: Math.abs(node.loc.start.column - column)
          });
        }
        if (node.loc.start.line === line) {
          const distance = Math.abs(node.loc.start.column - column);
          if (distance < closestDistance) {
            closestDistance = distance;
            closestNodePath = path4;
          }
        }
      }
    },
    // Also check JSXElement nodes that contain the position
    JSXElement(path4) {
      var _a;
      const node = path4.node;
      if (!node.loc) {
        return;
      }
      if (node.loc.start.line > line || node.loc.end.line < line) {
        return;
      }
      if (!((_a = path4.node.openingElement) == null ? void 0 : _a.loc)) {
        return;
      }
      const openingLine = path4.node.openingElement.loc.start.line;
      const openingCol = path4.node.openingElement.loc.start.column;
      if (openingLine === line) {
        const distance = Math.abs(openingCol - column);
        if (distance < closestDistance) {
          closestDistance = distance;
          closestNodePath = path4.get("openingElement");
        }
        return;
      }
      if (openingLine < line) {
        const distance = (line - openingLine) * 100;
        if (distance < closestDistance) {
          closestDistance = distance;
          closestNodePath = path4.get("openingElement");
        }
      }
    }
  };
  traverseBabel.default(ast, visitor);
  const threshold = closestDistance < 100 ? 50 : 500;
  return targetNodePath || (closestDistance <= threshold ? closestNodePath : null);
}
function generateCode(node, options = {}) {
  const generateFunction = generate.default || generate;
  const output = generateFunction(node, options);
  return output.code;
}
function generateSourceWithMap(ast, sourceFileName, originalCode) {
  const generateFunction = generate.default || generate;
  return generateFunction(ast, {
    sourceMaps: true,
    sourceFileName
  }, originalCode);
}

// plugins/visual-editor/vite-plugin-react-inline-editor.js
var EDITABLE_JSX_TAGS = ["a", "Link", "button", "Button", "p", "span", "h1", "h2", "h3", "h4", "h5", "h6", "label", "Label", "img"];
function parseEditId(editId) {
  const parts = editId.split(":");
  if (parts.length < 3) {
    return null;
  }
  const column = parseInt(parts.at(-1), 10);
  const line = parseInt(parts.at(-2), 10);
  const filePath = parts.slice(0, -2).join(":");
  if (!filePath || isNaN(line) || isNaN(column)) {
    return null;
  }
  return { filePath, line, column };
}
function checkTagNameEditable(openingElementNode, editableTagsList = EDITABLE_JSX_TAGS) {
  if (!openingElementNode || !openingElementNode.name)
    return false;
  const nameNode = openingElementNode.name;
  if (nameNode.type === "JSXIdentifier" && editableTagsList.includes(nameNode.name)) {
    return true;
  }
  if (nameNode.type === "JSXMemberExpression" && nameNode.property && nameNode.property.type === "JSXIdentifier" && editableTagsList.includes(nameNode.property.name)) {
    return true;
  }
  return false;
}
function validateImageSrc(openingNode) {
  var _a;
  if (!openingNode || !openingNode.name || openingNode.name.name !== "img" && ((_a = openingNode.name.property) == null ? void 0 : _a.name) !== "img") {
    return { isValid: true, reason: null };
  }
  const hasPropsSpread = openingNode.attributes.some(
    (attr) => t.isJSXSpreadAttribute(attr) && attr.argument && t.isIdentifier(attr.argument) && attr.argument.name === "props"
  );
  if (hasPropsSpread) {
    return { isValid: false, reason: "props-spread" };
  }
  const srcAttr = openingNode.attributes.find(
    (attr) => t.isJSXAttribute(attr) && attr.name && attr.name.name === "src"
  );
  if (!srcAttr) {
    return { isValid: false, reason: "missing-src" };
  }
  if (!t.isStringLiteral(srcAttr.value)) {
    return { isValid: false, reason: "dynamic-src" };
  }
  if (!srcAttr.value.value || srcAttr.value.value.trim() === "") {
    return { isValid: false, reason: "empty-src" };
  }
  return { isValid: true, reason: null };
}
function inlineEditPlugin() {
  return {
    name: "vite-inline-edit-plugin",
    enforce: "pre",
    transform(code, id) {
      if (!/\.(jsx|tsx)$/.test(id) || !id.startsWith(VITE_PROJECT_ROOT) || id.includes("node_modules")) {
        return null;
      }
      const relativeFilePath = path2.relative(VITE_PROJECT_ROOT, id);
      const webRelativeFilePath = relativeFilePath.split(path2.sep).join("/");
      try {
        const babelAst = parse2(code, {
          sourceType: "module",
          plugins: ["jsx", "typescript"],
          errorRecovery: true
        });
        let attributesAdded = 0;
        traverseBabel2.default(babelAst, {
          enter(path4) {
            var _a;
            if (path4.isJSXOpeningElement()) {
              const openingNode = path4.node;
              const elementNode = path4.parentPath.node;
              if (!openingNode.loc) {
                return;
              }
              const alreadyHasId = openingNode.attributes.some(
                (attr) => t.isJSXAttribute(attr) && attr.name.name === "data-edit-id"
              );
              if (alreadyHasId) {
                return;
              }
              const isCurrentElementEditable = checkTagNameEditable(openingNode, EDITABLE_JSX_TAGS);
              if (!isCurrentElementEditable) {
                return;
              }
              const imageValidation = validateImageSrc(openingNode);
              if (!imageValidation.isValid) {
                const disabledAttribute = t.jsxAttribute(
                  t.jsxIdentifier("data-edit-disabled"),
                  t.stringLiteral("true")
                );
                openingNode.attributes.push(disabledAttribute);
                attributesAdded++;
                return;
              }
              let shouldBeDisabledDueToChildren = false;
              if (t.isJSXElement(elementNode) && elementNode.children) {
                const hasPropsSpread = openingNode.attributes.some(
                  (attr) => t.isJSXSpreadAttribute(attr) && attr.argument && t.isIdentifier(attr.argument) && attr.argument.name === "props"
                );
                const hasDynamicChild = elementNode.children.some(
                  (child) => t.isJSXExpressionContainer(child)
                );
                if (hasDynamicChild || hasPropsSpread) {
                  shouldBeDisabledDueToChildren = true;
                }
              }
              if (!shouldBeDisabledDueToChildren && t.isJSXElement(elementNode) && elementNode.children) {
                const hasEditableJsxChild = elementNode.children.some((child) => {
                  if (t.isJSXElement(child)) {
                    return checkTagNameEditable(child.openingElement, EDITABLE_JSX_TAGS);
                  }
                  return false;
                });
                if (hasEditableJsxChild) {
                  shouldBeDisabledDueToChildren = true;
                }
              }
              if (shouldBeDisabledDueToChildren) {
                const disabledAttribute = t.jsxAttribute(
                  t.jsxIdentifier("data-edit-disabled"),
                  t.stringLiteral("true")
                );
                openingNode.attributes.push(disabledAttribute);
                attributesAdded++;
                return;
              }
              if (t.isJSXElement(elementNode) && elementNode.children && elementNode.children.length > 0) {
                let hasTextContent = false;
                let hasNonEditableJsxChild = false;
                let hasNonSelfClosingChild = false;
                for (const child of elementNode.children) {
                  if (t.isJSXText(child)) {
                    if (child.value.trim().length > 0)
                      hasTextContent = true;
                    continue;
                  }
                  if (t.isJSXElement(child)) {
                    const childNode = child.openingElement;
                    if (childNode.selfClosing) {
                      const childName = ((_a = childNode.name) == null ? void 0 : _a.name) || "";
                      if (!/^[A-Z]/.test(childName) && !checkTagNameEditable(childNode, EDITABLE_JSX_TAGS)) {
                        hasNonEditableJsxChild = true;
                      }
                      continue;
                    }
                    hasNonSelfClosingChild = true;
                    if (!checkTagNameEditable(childNode, EDITABLE_JSX_TAGS)) {
                      hasNonEditableJsxChild = true;
                    }
                  }
                }
                if (!hasTextContent && !hasNonSelfClosingChild)
                  return;
                if (hasNonEditableJsxChild) {
                  const disabledAttribute = t.jsxAttribute(
                    t.jsxIdentifier("data-edit-disabled"),
                    t.stringLiteral("true")
                  );
                  openingNode.attributes.push(disabledAttribute);
                  attributesAdded++;
                  return;
                }
              }
              let currentAncestorCandidatePath = path4.parentPath.parentPath;
              while (currentAncestorCandidatePath) {
                const ancestorJsxElementPath = currentAncestorCandidatePath.isJSXElement() ? currentAncestorCandidatePath : currentAncestorCandidatePath.findParent((p) => p.isJSXElement());
                if (!ancestorJsxElementPath) {
                  break;
                }
                if (checkTagNameEditable(ancestorJsxElementPath.node.openingElement, EDITABLE_JSX_TAGS)) {
                  return;
                }
                currentAncestorCandidatePath = ancestorJsxElementPath.parentPath;
              }
              const line = openingNode.loc.start.line;
              const column = openingNode.loc.start.column + 1;
              const editId = `${webRelativeFilePath}:${line}:${column}`;
              const idAttribute = t.jsxAttribute(
                t.jsxIdentifier("data-edit-id"),
                t.stringLiteral(editId)
              );
              openingNode.attributes.push(idAttribute);
              attributesAdded++;
            }
          }
        });
        if (attributesAdded > 0) {
          const output = generateSourceWithMap(babelAst, webRelativeFilePath, code);
          return { code: output.code, map: output.map };
        }
        return null;
      } catch (error) {
        console.error(`[vite][visual-editor] Error transforming ${id}:`, error);
        return null;
      }
    },
    // Updates source code based on the changes received from the client
    configureServer(server) {
      server.middlewares.use("/api/apply-edit", async (req, res, next) => {
        if (req.method !== "POST")
          return next();
        let body = "";
        req.on("data", (chunk) => {
          body += chunk.toString();
        });
        req.on("end", async () => {
          var _a;
          let absoluteFilePath = "";
          try {
            const { editId, newFullText } = JSON.parse(body);
            if (!editId || typeof newFullText === "undefined") {
              res.writeHead(400, { "Content-Type": "application/json" });
              return res.end(JSON.stringify({ error: "Missing editId or newFullText" }));
            }
            const parsedId = parseEditId(editId);
            if (!parsedId) {
              res.writeHead(400, { "Content-Type": "application/json" });
              return res.end(JSON.stringify({ error: "Invalid editId format (filePath:line:column)" }));
            }
            const { filePath, line, column } = parsedId;
            const validation = validateFilePath(filePath);
            if (!validation.isValid) {
              res.writeHead(400, { "Content-Type": "application/json" });
              return res.end(JSON.stringify({ error: validation.error }));
            }
            absoluteFilePath = validation.absolutePath;
            const originalContent = fs2.readFileSync(absoluteFilePath, "utf-8");
            const babelAst = parseFileToAST(absoluteFilePath);
            const targetNodePath = findJSXElementAtPosition(babelAst, line, column + 1);
            if (!targetNodePath) {
              res.writeHead(404, { "Content-Type": "application/json" });
              return res.end(JSON.stringify({ error: "Target node not found by line/column", editId }));
            }
            const targetOpeningElement = targetNodePath.node;
            const parentElementNode = (_a = targetNodePath.parentPath) == null ? void 0 : _a.node;
            const isImageElement = targetOpeningElement.name && targetOpeningElement.name.name === "img";
            let beforeCode = "";
            let afterCode = "";
            let modified = false;
            if (isImageElement) {
              beforeCode = generateCode(targetOpeningElement);
              const srcAttr = targetOpeningElement.attributes.find(
                (attr) => t.isJSXAttribute(attr) && attr.name && attr.name.name === "src"
              );
              if (srcAttr && t.isStringLiteral(srcAttr.value)) {
                srcAttr.value = t.stringLiteral(newFullText);
                modified = true;
                afterCode = generateCode(targetOpeningElement);
              }
            } else {
              if (parentElementNode && t.isJSXElement(parentElementNode)) {
                beforeCode = generateCode(parentElementNode);
                let textReplaced = false;
                parentElementNode.children = parentElementNode.children.reduce((acc, child) => {
                  if (t.isJSXText(child)) {
                    if (!textReplaced && child.value.trim().length > 0 && newFullText && newFullText.trim() !== "") {
                      const leading = child.value.match(/^(\s*)/)[0];
                      const trailing = child.value.match(/(\s*)$/)[0];
                      acc.push(t.jsxText(leading + newFullText.trim() + trailing));
                      textReplaced = true;
                    } else {
                      acc.push(child);
                    }
                    return acc;
                  }
                  acc.push(child);
                  return acc;
                }, []);
                if (!textReplaced && newFullText && newFullText.trim() !== "") {
                  parentElementNode.children.push(t.jsxText(newFullText));
                }
                modified = true;
                afterCode = generateCode(parentElementNode);
              }
            }
            if (!modified) {
              res.writeHead(409, { "Content-Type": "application/json" });
              return res.end(JSON.stringify({ error: "Could not apply changes to AST." }));
            }
            const webRelativeFilePath = path2.relative(VITE_PROJECT_ROOT, absoluteFilePath).split(path2.sep).join("/");
            const output = generateSourceWithMap(babelAst, webRelativeFilePath, originalContent);
            const newContent = output.code;
            res.writeHead(200, { "Content-Type": "application/json" });
            res.end(JSON.stringify({
              success: true,
              newFileContent: newContent,
              beforeCode,
              afterCode
            }));
          } catch (error) {
            res.writeHead(500, { "Content-Type": "application/json" });
            res.end(JSON.stringify({ error: "Internal server error during edit application." }));
          }
        });
      });
    }
  };
}

// plugins/visual-editor/vite-plugin-edit-mode.js
import { readFileSync } from "fs";
import { resolve } from "path";
import { fileURLToPath as fileURLToPath2 } from "url";

// plugins/visual-editor/visual-editor-config.js
var EDIT_MODE_STYLES = `
	#root[data-edit-mode-enabled="true"] [data-edit-id] {
		cursor: pointer; 
		outline: 2px dashed #357DF9; 
		outline-offset: 2px;
		min-height: 1em;
	}
	#root[data-edit-mode-enabled="true"] img[data-edit-id] {
		outline-offset: -2px;
	}
	#root[data-edit-mode-enabled="true"] {
		cursor: pointer;
	}
	#root[data-edit-mode-enabled="true"] [data-edit-id]:hover {
		background-color: #357DF933;
		outline-color: #357DF9; 
	}

	@keyframes fadeInTooltip {
		from {
			opacity: 0;
			transform: translateY(5px);
		}
		to {
			opacity: 1;
			transform: translateY(0);
		}
	}

	#inline-editor-disabled-tooltip {
		display: none; 
		opacity: 0; 
		position: absolute;
		background-color: #1D1E20;
		color: white;
		padding: 4px 8px;
		border-radius: 8px;
		z-index: 10001;
		font-size: 14px;
		border: 1px solid #3B3D4A;
		max-width: 184px;
		text-align: center;
	}

	#inline-editor-disabled-tooltip.tooltip-active {
		display: block;
		animation: fadeInTooltip 0.2s ease-out forwards;
	}
`;

// plugins/visual-editor/vite-plugin-edit-mode.js
var __vite_injected_original_import_meta_url2 = "file:///C:/Users/Jazmin%20Reyes%20Gris/Proyecto/proyectos/Tradeamx-plataforma/plugins/visual-editor/vite-plugin-edit-mode.js";
var __filename2 = fileURLToPath2(__vite_injected_original_import_meta_url2);
var __dirname3 = resolve(__filename2, "..");
function inlineEditDevPlugin() {
  return {
    name: "vite:inline-edit-dev",
    apply: "serve",
    transformIndexHtml() {
      const scriptPath = resolve(__dirname3, "edit-mode-script.js");
      const scriptContent = readFileSync(scriptPath, "utf-8");
      return [
        {
          tag: "script",
          attrs: { type: "module" },
          children: scriptContent,
          injectTo: "body"
        },
        {
          tag: "style",
          children: EDIT_MODE_STYLES,
          injectTo: "head"
        }
      ];
    }
  };
}

// plugins/vite-plugin-iframe-route-restoration.js
function iframeRouteRestorationPlugin() {
  return {
    name: "vite:iframe-route-restoration",
    apply: "serve",
    transformIndexHtml() {
      const script = `
      const ALLOWED_PARENT_ORIGINS = [
          "https://horizons.hostinger.com",
          "https://horizons.hostinger.dev",
          "https://horizons-frontend-local.hostinger.dev",
      ];

        // Check to see if the page is in an iframe
        if (window.self !== window.top) {
          const STORAGE_KEY = 'horizons-iframe-saved-route';

          const getCurrentRoute = () => location.pathname + location.search + location.hash;

          const save = () => {
            try {
              const currentRoute = getCurrentRoute();
              sessionStorage.setItem(STORAGE_KEY, currentRoute);
              window.parent.postMessage({message: 'route-changed', route: currentRoute}, '*');
            } catch {}
          };

          const replaceHistoryState = (url) => {
            try {
              history.replaceState(null, '', url);
              window.dispatchEvent(new PopStateEvent('popstate', { state: history.state }));
              return true;
            } catch {}
            return false;
          };

          const restore = () => {
            try {
              const saved = sessionStorage.getItem(STORAGE_KEY);
              if (!saved) return;

              if (!saved.startsWith('/')) {
                sessionStorage.removeItem(STORAGE_KEY);
                return;
              }

              const current = getCurrentRoute();
              if (current !== saved) {
                if (!replaceHistoryState(saved)) {
                  replaceHistoryState('/');
                }

                requestAnimationFrame(() => setTimeout(() => {
                  try {
                    const text = (document.body?.innerText || '').trim();

                    // If the restored route results in too little content, assume it is invalid and navigate home
                    if (text.length < 50) {
                      replaceHistoryState('/');
                    }
                  } catch {}
                }, 1000));
              }
            } catch {}
          };

          const originalPushState = history.pushState;
          history.pushState = function(...args) {
            originalPushState.apply(this, args);
            save();
          };

          const originalReplaceState = history.replaceState;
          history.replaceState = function(...args) {
            originalReplaceState.apply(this, args);
            save();
          };

          const getParentOrigin = () => {
              if (
                  window.location.ancestorOrigins &&
                  window.location.ancestorOrigins.length > 0
              ) {
                  return window.location.ancestorOrigins[0];
              }

              if (document.referrer) {
                  try {
                      return new URL(document.referrer).origin;
                  } catch (e) {
                      console.warn("Invalid referrer URL:", document.referrer);
                  }
              }

              return null;
          };

          window.addEventListener('popstate', save);
          window.addEventListener('hashchange', save);
          window.addEventListener("message", function (event) {
              const parentOrigin = getParentOrigin();

              if (event.data?.type === "redirect-home" && parentOrigin && ALLOWED_PARENT_ORIGINS.includes(parentOrigin)) {
                const saved = sessionStorage.getItem(STORAGE_KEY);

                if(saved && saved !== '/') {
                  replaceHistoryState('/')
                }
              }
          });

          restore();
        }
      `;
      return [
        {
          tag: "script",
          attrs: { type: "module" },
          children: script,
          injectTo: "head"
        }
      ];
    }
  };
}

// plugins/selection-mode/vite-plugin-selection-mode.js
import { readFileSync as readFileSync2 } from "node:fs";
import { resolve as resolve2 } from "node:path";
import { fileURLToPath as fileURLToPath3 } from "node:url";
var __vite_injected_original_import_meta_url3 = "file:///C:/Users/Jazmin%20Reyes%20Gris/Proyecto/proyectos/Tradeamx-plataforma/plugins/selection-mode/vite-plugin-selection-mode.js";
var __filename3 = fileURLToPath3(__vite_injected_original_import_meta_url3);
var __dirname4 = resolve2(__filename3, "..");
function selectionModePlugin() {
  return {
    name: "vite:selection-mode",
    apply: "serve",
    transformIndexHtml() {
      const scriptPath = resolve2(__dirname4, "selection-mode-script.js");
      const scriptContent = readFileSync2(scriptPath, "utf-8");
      return [
        {
          tag: "script",
          attrs: { type: "module" },
          children: scriptContent,
          injectTo: "body"
        }
      ];
    }
  };
}

// vite.config.js
var __vite_injected_original_dirname = "C:\\Users\\Jazmin Reyes Gris\\Proyecto\\proyectos\\Tradeamx-plataforma";
var isDev = process.env.NODE_ENV !== "production";
var configHorizonsViteErrorHandler = `
const observer = new MutationObserver((mutations) => {
	for (const mutation of mutations) {
		for (const addedNode of mutation.addedNodes) {
			if (
				addedNode.nodeType === Node.ELEMENT_NODE &&
				(
					addedNode.tagName?.toLowerCase() === 'vite-error-overlay' ||
					addedNode.classList?.contains('backdrop')
				)
			) {
				handleViteOverlay(addedNode);
			}
		}
	}
});

observer.observe(document.documentElement, {
	childList: true,
	subtree: true
});

function handleViteOverlay(node) {
	if (!node.shadowRoot) {
		return;
	}

	const backdrop = node.shadowRoot.querySelector('.backdrop');

	if (backdrop) {
		const overlayHtml = backdrop.outerHTML;
		const parser = new DOMParser();
		const doc = parser.parseFromString(overlayHtml, 'text/html');
		const messageBodyElement = doc.querySelector('.message-body');
		const fileElement = doc.querySelector('.file');
		const messageText = messageBodyElement ? messageBodyElement.textContent.trim() : '';
		const fileText = fileElement ? fileElement.textContent.trim() : '';
		const error = messageText + (fileText ? ' File:' + fileText : '');

		window.parent.postMessage({
			type: 'horizons-vite-error',
			error,
		}, '*');
	}
}
`;
var configHorizonsRuntimeErrorHandler = `
window.onerror = (message, source, lineno, colno, errorObj) => {
	const errorDetails = errorObj ? JSON.stringify({
		name: errorObj.name,
		message: errorObj.message,
		stack: errorObj.stack,
		source,
		lineno,
		colno,
	}) : null;

	window.parent.postMessage({
		type: 'horizons-runtime-error',
		message,
		error: errorDetails
	}, '*');
};
`;
var configHorizonsConsoleErrorHandler = `
const originalConsoleError = console.error;
const MATCH_LINE_COL_REGEX = /:(\\d+):(\\d+)\\)?\\s*$/; // regex to match the :lineNum:colNum
const MATCH_AT_REGEX = /^\\s*at\\s+(?:async\\s+)?(?:.*?\\s+)?\\(?/; // regex to remove the 'at' keyword and any 'async' or function name
const MATCH_PATH_REGEX = /^\\//; // regex to remove the leading slash

function parseStackFrameLine(line) {
	const lineColMatch = line.match(MATCH_LINE_COL_REGEX);
	if (!lineColMatch) return null;
	const [, lineNum, colNum] = lineColMatch;
	const suffix = \`:\${lineNum}:\${colNum}\`;
	const idx = line.lastIndexOf(suffix);
	if (idx === -1) return null;
	const before = line.substring(0, idx);
	const path = before.replace(MATCH_AT_REGEX, '').trim();
	if (!path) return null;

	try {
		const pathname = new URL(path).pathname;
		const filePath = pathname.replace(MATCH_PATH_REGEX, '') || pathname;
		return \`\${filePath}:\${lineNum}:\${colNum}\`;
	} catch (e) {
		const filePath = path.replace(MATCH_PATH_REGEX, '') || path;
		return \`\${filePath}:\${lineNum}:\${colNum}\`;
	}
}

function getFilePathFromStack(stack, skipFrames = 0) {
	if (!stack || typeof stack !== 'string') return null;
	const lines = stack.split('\\n').slice(1);

	const frames = lines.map(line => parseStackFrameLine(line.replace(/\\r$/, ''))).filter(Boolean);

	return frames[skipFrames] ?? null;
}

console.error = function(...args) {
	originalConsoleError.apply(console, args);

	let errorString = '';
	let filePath = null;

	for (let i = 0; i < args.length; i++) {
		const arg = args[i];
		if (arg instanceof Error) {
			filePath = getFilePathFromStack(arg.stack, 0);
			errorString = \`\${arg.name}: \${arg.message}\`;
			if (filePath) {
				errorString = \`\${errorString} at \${filePath}\`;
			}
			break;
		}
	}

	if (!errorString) {
		errorString = args.map(arg => typeof arg === 'object' ? JSON.stringify(arg) : String(arg)).join(' ');
		const stack = new Error().stack;
		filePath = getFilePathFromStack(stack, 1);
		if (filePath) {
			errorString = \`\${errorString} at \${filePath}\`;
		}
	}

	window.parent.postMessage({
		type: 'horizons-console-error',
		error: errorString
	}, '*');
};
`;
var configWindowFetchMonkeyPatch = `
const originalFetch = window.fetch;

window.fetch = function(...args) {
	const url = args[0] instanceof Request ? args[0].url : args[0];

	// Skip WebSocket URLs
	if (url.startsWith('ws:') || url.startsWith('wss:')) {
		return originalFetch.apply(this, args);
	}

	return originalFetch.apply(this, args)
		.then(async response => {
			const contentType = response.headers.get('Content-Type') || '';

			// Exclude HTML document responses
			const isDocumentResponse =
				contentType.includes('text/html') ||
				contentType.includes('application/xhtml+xml');

			if (!response.ok && !isDocumentResponse) {
					const responseClone = response.clone();
					const errorFromRes = await responseClone.text();
					const requestUrl = response.url;
					console.error(\`Fetch error from \${requestUrl}: \${errorFromRes}\`);
			}

			return response;
		})
		.catch(error => {
			if (!url.match(/.html?$/i)) {
				console.error(error);
			}

			throw error;
		});
};
`;
var configNavigationHandler = `
if (window.navigation && window.self !== window.top) {
	window.navigation.addEventListener('navigate', (event) => {
		const url = event.destination.url;

		try {
			const destinationUrl = new URL(url);
			const destinationOrigin = destinationUrl.origin;
			const currentOrigin = window.location.origin;

			if (destinationOrigin === currentOrigin) {
				return;
			}
		} catch (error) {
			return;
		}

		window.parent.postMessage({
			type: 'horizons-navigation-error',
			url,
		}, '*');
	});
}
`;
var addTransformIndexHtml = {
  name: "add-transform-index-html",
  transformIndexHtml(html) {
    const tags = [
      {
        tag: "script",
        attrs: { type: "module" },
        children: configHorizonsRuntimeErrorHandler,
        injectTo: "head"
      },
      {
        tag: "script",
        attrs: { type: "module" },
        children: configHorizonsViteErrorHandler,
        injectTo: "head"
      },
      {
        tag: "script",
        attrs: { type: "module" },
        children: configHorizonsConsoleErrorHandler,
        injectTo: "head"
      },
      {
        tag: "script",
        attrs: { type: "module" },
        children: configWindowFetchMonkeyPatch,
        injectTo: "head"
      },
      {
        tag: "script",
        attrs: { type: "module" },
        children: configNavigationHandler,
        injectTo: "head"
      }
    ];
    if (!isDev && process.env.TEMPLATE_BANNER_SCRIPT_URL && process.env.TEMPLATE_REDIRECT_URL) {
      tags.push(
        {
          tag: "script",
          attrs: {
            src: process.env.TEMPLATE_BANNER_SCRIPT_URL,
            "template-redirect-url": process.env.TEMPLATE_REDIRECT_URL
          },
          injectTo: "head"
        }
      );
    }
    return {
      html,
      tags
    };
  }
};
console.warn = () => {
};
var logger = createLogger();
var loggerError = logger.error;
logger.error = (msg, options) => {
  var _a;
  if ((_a = options == null ? void 0 : options.error) == null ? void 0 : _a.toString().includes("CssSyntaxError: [postcss]")) {
    return;
  }
  loggerError(msg, options);
};
var vite_config_default = defineConfig({
  base: "/",
  customLogger: logger,
  plugins: [
    ...isDev ? [inlineEditPlugin(), inlineEditDevPlugin(), iframeRouteRestorationPlugin(), selectionModePlugin()] : [],
    react(),
    addTransformIndexHtml,
    // ── PWA ──────────────────────────────────────────────────
    VitePWA({
      registerType: "autoUpdate",
      includeAssets: [
        "favicon-16x16.png",
        "favicon-32x32.png",
        "apple-touch-icon.png"
      ],
      manifest: {
        name: "TradeAMX - Funding Tomorrow's Traders",
        short_name: "TradeAMX",
        description: "\xDAnete a TradeAMX, la prop firm l\xEDder en trading. Obt\xE9n capital de hasta $100k para operar en los mercados financieros.",
        theme_color: "#0f172a",
        background_color: "#0f172a",
        display: "standalone",
        orientation: "portrait",
        scope: "/",
        start_url: "/",
        icons: [
          { src: "/icons/icon-72x72.png", sizes: "72x72", type: "image/png" },
          { src: "/icons/icon-96x96.png", sizes: "96x96", type: "image/png" },
          { src: "/icons/icon-128x128.png", sizes: "128x128", type: "image/png" },
          { src: "/icons/icon-144x144.png", sizes: "144x144", type: "image/png" },
          { src: "/icons/icon-152x152.png", sizes: "152x152", type: "image/png" },
          { src: "/icons/icon-192x192.png", sizes: "192x192", type: "image/png", purpose: "any" },
          { src: "/icons/icon-384x384.png", sizes: "384x384", type: "image/png" },
          { src: "/icons/icon-512x512.png", sizes: "512x512", type: "image/png", purpose: "any" },
          { src: "/icons/maskable-icon-512x512.png", sizes: "512x512", type: "image/png", purpose: "maskable" }
        ]
      },
      workbox: {
        // No cachear llamadas a Supabase ni APIs de precios — siempre frescas
        navigateFallbackDenylist: [/^\/admin/, /^\/api/],
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/.*\.supabase\.co\/.*/i,
            handler: "NetworkOnly"
          },
          {
            urlPattern: /\.(?:png|jpg|jpeg|svg|gif|webp)$/,
            handler: "CacheFirst",
            options: {
              cacheName: "images-cache",
              expiration: { maxEntries: 60, maxAgeSeconds: 30 * 24 * 60 * 60 }
            }
          }
        ]
      },
      devOptions: {
        enabled: false
        // evita conflictos con el visual editor en dev
      }
    })
  ],
  server: {
    cors: true,
    headers: {
      "Cross-Origin-Embedder-Policy": "credentialless"
    },
    allowedHosts: true
  },
  resolve: {
    extensions: [".jsx", ".js", ".tsx", ".ts", ".json"],
    alias: {
      "@": path3.resolve(__vite_injected_original_dirname, "./src")
    }
  },
  build: {
    rollupOptions: {
      external: [
        "@babel/parser",
        "@babel/traverse",
        "@babel/generator",
        "@babel/types"
      ]
    }
  }
});
export {
  vite_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcuanMiLCAicGx1Z2lucy92aXN1YWwtZWRpdG9yL3ZpdGUtcGx1Z2luLXJlYWN0LWlubGluZS1lZGl0b3IuanMiLCAicGx1Z2lucy91dGlscy9hc3QtdXRpbHMuanMiLCAicGx1Z2lucy92aXN1YWwtZWRpdG9yL3ZpdGUtcGx1Z2luLWVkaXQtbW9kZS5qcyIsICJwbHVnaW5zL3Zpc3VhbC1lZGl0b3IvdmlzdWFsLWVkaXRvci1jb25maWcuanMiLCAicGx1Z2lucy92aXRlLXBsdWdpbi1pZnJhbWUtcm91dGUtcmVzdG9yYXRpb24uanMiLCAicGx1Z2lucy9zZWxlY3Rpb24tbW9kZS92aXRlLXBsdWdpbi1zZWxlY3Rpb24tbW9kZS5qcyJdLAogICJzb3VyY2VzQ29udGVudCI6IFsiY29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2Rpcm5hbWUgPSBcIkM6XFxcXFVzZXJzXFxcXEphem1pbiBSZXllcyBHcmlzXFxcXFByb3llY3RvXFxcXHByb3llY3Rvc1xcXFxUcmFkZWFteC1wbGF0YWZvcm1hXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ZpbGVuYW1lID0gXCJDOlxcXFxVc2Vyc1xcXFxKYXptaW4gUmV5ZXMgR3Jpc1xcXFxQcm95ZWN0b1xcXFxwcm95ZWN0b3NcXFxcVHJhZGVhbXgtcGxhdGFmb3JtYVxcXFx2aXRlLmNvbmZpZy5qc1wiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9pbXBvcnRfbWV0YV91cmwgPSBcImZpbGU6Ly8vQzovVXNlcnMvSmF6bWluJTIwUmV5ZXMlMjBHcmlzL1Byb3llY3RvL3Byb3llY3Rvcy9UcmFkZWFteC1wbGF0YWZvcm1hL3ZpdGUuY29uZmlnLmpzXCI7aW1wb3J0IHBhdGggZnJvbSAnbm9kZTpwYXRoJztcbmltcG9ydCByZWFjdCBmcm9tICdAdml0ZWpzL3BsdWdpbi1yZWFjdCc7XG5pbXBvcnQgeyBjcmVhdGVMb2dnZXIsIGRlZmluZUNvbmZpZyB9IGZyb20gJ3ZpdGUnO1xuaW1wb3J0IHsgVml0ZVBXQSB9IGZyb20gJ3ZpdGUtcGx1Z2luLXB3YSc7XG5pbXBvcnQgaW5saW5lRWRpdFBsdWdpbiBmcm9tICcuL3BsdWdpbnMvdmlzdWFsLWVkaXRvci92aXRlLXBsdWdpbi1yZWFjdC1pbmxpbmUtZWRpdG9yLmpzJztcbmltcG9ydCBlZGl0TW9kZURldlBsdWdpbiBmcm9tICcuL3BsdWdpbnMvdmlzdWFsLWVkaXRvci92aXRlLXBsdWdpbi1lZGl0LW1vZGUuanMnO1xuaW1wb3J0IGlmcmFtZVJvdXRlUmVzdG9yYXRpb25QbHVnaW4gZnJvbSAnLi9wbHVnaW5zL3ZpdGUtcGx1Z2luLWlmcmFtZS1yb3V0ZS1yZXN0b3JhdGlvbi5qcyc7XG5pbXBvcnQgc2VsZWN0aW9uTW9kZVBsdWdpbiBmcm9tICcuL3BsdWdpbnMvc2VsZWN0aW9uLW1vZGUvdml0ZS1wbHVnaW4tc2VsZWN0aW9uLW1vZGUuanMnO1xuXG5jb25zdCBpc0RldiA9IHByb2Nlc3MuZW52Lk5PREVfRU5WICE9PSAncHJvZHVjdGlvbic7XG5cbmNvbnN0IGNvbmZpZ0hvcml6b25zVml0ZUVycm9ySGFuZGxlciA9IGBcbmNvbnN0IG9ic2VydmVyID0gbmV3IE11dGF0aW9uT2JzZXJ2ZXIoKG11dGF0aW9ucykgPT4ge1xuXHRmb3IgKGNvbnN0IG11dGF0aW9uIG9mIG11dGF0aW9ucykge1xuXHRcdGZvciAoY29uc3QgYWRkZWROb2RlIG9mIG11dGF0aW9uLmFkZGVkTm9kZXMpIHtcblx0XHRcdGlmIChcblx0XHRcdFx0YWRkZWROb2RlLm5vZGVUeXBlID09PSBOb2RlLkVMRU1FTlRfTk9ERSAmJlxuXHRcdFx0XHQoXG5cdFx0XHRcdFx0YWRkZWROb2RlLnRhZ05hbWU/LnRvTG93ZXJDYXNlKCkgPT09ICd2aXRlLWVycm9yLW92ZXJsYXknIHx8XG5cdFx0XHRcdFx0YWRkZWROb2RlLmNsYXNzTGlzdD8uY29udGFpbnMoJ2JhY2tkcm9wJylcblx0XHRcdFx0KVxuXHRcdFx0KSB7XG5cdFx0XHRcdGhhbmRsZVZpdGVPdmVybGF5KGFkZGVkTm9kZSk7XG5cdFx0XHR9XG5cdFx0fVxuXHR9XG59KTtcblxub2JzZXJ2ZXIub2JzZXJ2ZShkb2N1bWVudC5kb2N1bWVudEVsZW1lbnQsIHtcblx0Y2hpbGRMaXN0OiB0cnVlLFxuXHRzdWJ0cmVlOiB0cnVlXG59KTtcblxuZnVuY3Rpb24gaGFuZGxlVml0ZU92ZXJsYXkobm9kZSkge1xuXHRpZiAoIW5vZGUuc2hhZG93Um9vdCkge1xuXHRcdHJldHVybjtcblx0fVxuXG5cdGNvbnN0IGJhY2tkcm9wID0gbm9kZS5zaGFkb3dSb290LnF1ZXJ5U2VsZWN0b3IoJy5iYWNrZHJvcCcpO1xuXG5cdGlmIChiYWNrZHJvcCkge1xuXHRcdGNvbnN0IG92ZXJsYXlIdG1sID0gYmFja2Ryb3Aub3V0ZXJIVE1MO1xuXHRcdGNvbnN0IHBhcnNlciA9IG5ldyBET01QYXJzZXIoKTtcblx0XHRjb25zdCBkb2MgPSBwYXJzZXIucGFyc2VGcm9tU3RyaW5nKG92ZXJsYXlIdG1sLCAndGV4dC9odG1sJyk7XG5cdFx0Y29uc3QgbWVzc2FnZUJvZHlFbGVtZW50ID0gZG9jLnF1ZXJ5U2VsZWN0b3IoJy5tZXNzYWdlLWJvZHknKTtcblx0XHRjb25zdCBmaWxlRWxlbWVudCA9IGRvYy5xdWVyeVNlbGVjdG9yKCcuZmlsZScpO1xuXHRcdGNvbnN0IG1lc3NhZ2VUZXh0ID0gbWVzc2FnZUJvZHlFbGVtZW50ID8gbWVzc2FnZUJvZHlFbGVtZW50LnRleHRDb250ZW50LnRyaW0oKSA6ICcnO1xuXHRcdGNvbnN0IGZpbGVUZXh0ID0gZmlsZUVsZW1lbnQgPyBmaWxlRWxlbWVudC50ZXh0Q29udGVudC50cmltKCkgOiAnJztcblx0XHRjb25zdCBlcnJvciA9IG1lc3NhZ2VUZXh0ICsgKGZpbGVUZXh0ID8gJyBGaWxlOicgKyBmaWxlVGV4dCA6ICcnKTtcblxuXHRcdHdpbmRvdy5wYXJlbnQucG9zdE1lc3NhZ2Uoe1xuXHRcdFx0dHlwZTogJ2hvcml6b25zLXZpdGUtZXJyb3InLFxuXHRcdFx0ZXJyb3IsXG5cdFx0fSwgJyonKTtcblx0fVxufVxuYDtcblxuY29uc3QgY29uZmlnSG9yaXpvbnNSdW50aW1lRXJyb3JIYW5kbGVyID0gYFxud2luZG93Lm9uZXJyb3IgPSAobWVzc2FnZSwgc291cmNlLCBsaW5lbm8sIGNvbG5vLCBlcnJvck9iaikgPT4ge1xuXHRjb25zdCBlcnJvckRldGFpbHMgPSBlcnJvck9iaiA/IEpTT04uc3RyaW5naWZ5KHtcblx0XHRuYW1lOiBlcnJvck9iai5uYW1lLFxuXHRcdG1lc3NhZ2U6IGVycm9yT2JqLm1lc3NhZ2UsXG5cdFx0c3RhY2s6IGVycm9yT2JqLnN0YWNrLFxuXHRcdHNvdXJjZSxcblx0XHRsaW5lbm8sXG5cdFx0Y29sbm8sXG5cdH0pIDogbnVsbDtcblxuXHR3aW5kb3cucGFyZW50LnBvc3RNZXNzYWdlKHtcblx0XHR0eXBlOiAnaG9yaXpvbnMtcnVudGltZS1lcnJvcicsXG5cdFx0bWVzc2FnZSxcblx0XHRlcnJvcjogZXJyb3JEZXRhaWxzXG5cdH0sICcqJyk7XG59O1xuYDtcblxuY29uc3QgY29uZmlnSG9yaXpvbnNDb25zb2xlRXJyb3JIYW5kbGVyID0gYFxuY29uc3Qgb3JpZ2luYWxDb25zb2xlRXJyb3IgPSBjb25zb2xlLmVycm9yO1xuY29uc3QgTUFUQ0hfTElORV9DT0xfUkVHRVggPSAvOihcXFxcZCspOihcXFxcZCspXFxcXCk/XFxcXHMqJC87IC8vIHJlZ2V4IHRvIG1hdGNoIHRoZSA6bGluZU51bTpjb2xOdW1cbmNvbnN0IE1BVENIX0FUX1JFR0VYID0gL15cXFxccyphdFxcXFxzKyg/OmFzeW5jXFxcXHMrKT8oPzouKj9cXFxccyspP1xcXFwoPy87IC8vIHJlZ2V4IHRvIHJlbW92ZSB0aGUgJ2F0JyBrZXl3b3JkIGFuZCBhbnkgJ2FzeW5jJyBvciBmdW5jdGlvbiBuYW1lXG5jb25zdCBNQVRDSF9QQVRIX1JFR0VYID0gL15cXFxcLy87IC8vIHJlZ2V4IHRvIHJlbW92ZSB0aGUgbGVhZGluZyBzbGFzaFxuXG5mdW5jdGlvbiBwYXJzZVN0YWNrRnJhbWVMaW5lKGxpbmUpIHtcblx0Y29uc3QgbGluZUNvbE1hdGNoID0gbGluZS5tYXRjaChNQVRDSF9MSU5FX0NPTF9SRUdFWCk7XG5cdGlmICghbGluZUNvbE1hdGNoKSByZXR1cm4gbnVsbDtcblx0Y29uc3QgWywgbGluZU51bSwgY29sTnVtXSA9IGxpbmVDb2xNYXRjaDtcblx0Y29uc3Qgc3VmZml4ID0gXFxgOlxcJHtsaW5lTnVtfTpcXCR7Y29sTnVtfVxcYDtcblx0Y29uc3QgaWR4ID0gbGluZS5sYXN0SW5kZXhPZihzdWZmaXgpO1xuXHRpZiAoaWR4ID09PSAtMSkgcmV0dXJuIG51bGw7XG5cdGNvbnN0IGJlZm9yZSA9IGxpbmUuc3Vic3RyaW5nKDAsIGlkeCk7XG5cdGNvbnN0IHBhdGggPSBiZWZvcmUucmVwbGFjZShNQVRDSF9BVF9SRUdFWCwgJycpLnRyaW0oKTtcblx0aWYgKCFwYXRoKSByZXR1cm4gbnVsbDtcblxuXHR0cnkge1xuXHRcdGNvbnN0IHBhdGhuYW1lID0gbmV3IFVSTChwYXRoKS5wYXRobmFtZTtcblx0XHRjb25zdCBmaWxlUGF0aCA9IHBhdGhuYW1lLnJlcGxhY2UoTUFUQ0hfUEFUSF9SRUdFWCwgJycpIHx8IHBhdGhuYW1lO1xuXHRcdHJldHVybiBcXGBcXCR7ZmlsZVBhdGh9OlxcJHtsaW5lTnVtfTpcXCR7Y29sTnVtfVxcYDtcblx0fSBjYXRjaCAoZSkge1xuXHRcdGNvbnN0IGZpbGVQYXRoID0gcGF0aC5yZXBsYWNlKE1BVENIX1BBVEhfUkVHRVgsICcnKSB8fCBwYXRoO1xuXHRcdHJldHVybiBcXGBcXCR7ZmlsZVBhdGh9OlxcJHtsaW5lTnVtfTpcXCR7Y29sTnVtfVxcYDtcblx0fVxufVxuXG5mdW5jdGlvbiBnZXRGaWxlUGF0aEZyb21TdGFjayhzdGFjaywgc2tpcEZyYW1lcyA9IDApIHtcblx0aWYgKCFzdGFjayB8fCB0eXBlb2Ygc3RhY2sgIT09ICdzdHJpbmcnKSByZXR1cm4gbnVsbDtcblx0Y29uc3QgbGluZXMgPSBzdGFjay5zcGxpdCgnXFxcXG4nKS5zbGljZSgxKTtcblxuXHRjb25zdCBmcmFtZXMgPSBsaW5lcy5tYXAobGluZSA9PiBwYXJzZVN0YWNrRnJhbWVMaW5lKGxpbmUucmVwbGFjZSgvXFxcXHIkLywgJycpKSkuZmlsdGVyKEJvb2xlYW4pO1xuXG5cdHJldHVybiBmcmFtZXNbc2tpcEZyYW1lc10gPz8gbnVsbDtcbn1cblxuY29uc29sZS5lcnJvciA9IGZ1bmN0aW9uKC4uLmFyZ3MpIHtcblx0b3JpZ2luYWxDb25zb2xlRXJyb3IuYXBwbHkoY29uc29sZSwgYXJncyk7XG5cblx0bGV0IGVycm9yU3RyaW5nID0gJyc7XG5cdGxldCBmaWxlUGF0aCA9IG51bGw7XG5cblx0Zm9yIChsZXQgaSA9IDA7IGkgPCBhcmdzLmxlbmd0aDsgaSsrKSB7XG5cdFx0Y29uc3QgYXJnID0gYXJnc1tpXTtcblx0XHRpZiAoYXJnIGluc3RhbmNlb2YgRXJyb3IpIHtcblx0XHRcdGZpbGVQYXRoID0gZ2V0RmlsZVBhdGhGcm9tU3RhY2soYXJnLnN0YWNrLCAwKTtcblx0XHRcdGVycm9yU3RyaW5nID0gXFxgXFwke2FyZy5uYW1lfTogXFwke2FyZy5tZXNzYWdlfVxcYDtcblx0XHRcdGlmIChmaWxlUGF0aCkge1xuXHRcdFx0XHRlcnJvclN0cmluZyA9IFxcYFxcJHtlcnJvclN0cmluZ30gYXQgXFwke2ZpbGVQYXRofVxcYDtcblx0XHRcdH1cblx0XHRcdGJyZWFrO1xuXHRcdH1cblx0fVxuXG5cdGlmICghZXJyb3JTdHJpbmcpIHtcblx0XHRlcnJvclN0cmluZyA9IGFyZ3MubWFwKGFyZyA9PiB0eXBlb2YgYXJnID09PSAnb2JqZWN0JyA/IEpTT04uc3RyaW5naWZ5KGFyZykgOiBTdHJpbmcoYXJnKSkuam9pbignICcpO1xuXHRcdGNvbnN0IHN0YWNrID0gbmV3IEVycm9yKCkuc3RhY2s7XG5cdFx0ZmlsZVBhdGggPSBnZXRGaWxlUGF0aEZyb21TdGFjayhzdGFjaywgMSk7XG5cdFx0aWYgKGZpbGVQYXRoKSB7XG5cdFx0XHRlcnJvclN0cmluZyA9IFxcYFxcJHtlcnJvclN0cmluZ30gYXQgXFwke2ZpbGVQYXRofVxcYDtcblx0XHR9XG5cdH1cblxuXHR3aW5kb3cucGFyZW50LnBvc3RNZXNzYWdlKHtcblx0XHR0eXBlOiAnaG9yaXpvbnMtY29uc29sZS1lcnJvcicsXG5cdFx0ZXJyb3I6IGVycm9yU3RyaW5nXG5cdH0sICcqJyk7XG59O1xuYDtcblxuY29uc3QgY29uZmlnV2luZG93RmV0Y2hNb25rZXlQYXRjaCA9IGBcbmNvbnN0IG9yaWdpbmFsRmV0Y2ggPSB3aW5kb3cuZmV0Y2g7XG5cbndpbmRvdy5mZXRjaCA9IGZ1bmN0aW9uKC4uLmFyZ3MpIHtcblx0Y29uc3QgdXJsID0gYXJnc1swXSBpbnN0YW5jZW9mIFJlcXVlc3QgPyBhcmdzWzBdLnVybCA6IGFyZ3NbMF07XG5cblx0Ly8gU2tpcCBXZWJTb2NrZXQgVVJMc1xuXHRpZiAodXJsLnN0YXJ0c1dpdGgoJ3dzOicpIHx8IHVybC5zdGFydHNXaXRoKCd3c3M6JykpIHtcblx0XHRyZXR1cm4gb3JpZ2luYWxGZXRjaC5hcHBseSh0aGlzLCBhcmdzKTtcblx0fVxuXG5cdHJldHVybiBvcmlnaW5hbEZldGNoLmFwcGx5KHRoaXMsIGFyZ3MpXG5cdFx0LnRoZW4oYXN5bmMgcmVzcG9uc2UgPT4ge1xuXHRcdFx0Y29uc3QgY29udGVudFR5cGUgPSByZXNwb25zZS5oZWFkZXJzLmdldCgnQ29udGVudC1UeXBlJykgfHwgJyc7XG5cblx0XHRcdC8vIEV4Y2x1ZGUgSFRNTCBkb2N1bWVudCByZXNwb25zZXNcblx0XHRcdGNvbnN0IGlzRG9jdW1lbnRSZXNwb25zZSA9XG5cdFx0XHRcdGNvbnRlbnRUeXBlLmluY2x1ZGVzKCd0ZXh0L2h0bWwnKSB8fFxuXHRcdFx0XHRjb250ZW50VHlwZS5pbmNsdWRlcygnYXBwbGljYXRpb24veGh0bWwreG1sJyk7XG5cblx0XHRcdGlmICghcmVzcG9uc2Uub2sgJiYgIWlzRG9jdW1lbnRSZXNwb25zZSkge1xuXHRcdFx0XHRcdGNvbnN0IHJlc3BvbnNlQ2xvbmUgPSByZXNwb25zZS5jbG9uZSgpO1xuXHRcdFx0XHRcdGNvbnN0IGVycm9yRnJvbVJlcyA9IGF3YWl0IHJlc3BvbnNlQ2xvbmUudGV4dCgpO1xuXHRcdFx0XHRcdGNvbnN0IHJlcXVlc3RVcmwgPSByZXNwb25zZS51cmw7XG5cdFx0XHRcdFx0Y29uc29sZS5lcnJvcihcXGBGZXRjaCBlcnJvciBmcm9tIFxcJHtyZXF1ZXN0VXJsfTogXFwke2Vycm9yRnJvbVJlc31cXGApO1xuXHRcdFx0fVxuXG5cdFx0XHRyZXR1cm4gcmVzcG9uc2U7XG5cdFx0fSlcblx0XHQuY2F0Y2goZXJyb3IgPT4ge1xuXHRcdFx0aWYgKCF1cmwubWF0Y2goL1xcLmh0bWw/JC9pKSkge1xuXHRcdFx0XHRjb25zb2xlLmVycm9yKGVycm9yKTtcblx0XHRcdH1cblxuXHRcdFx0dGhyb3cgZXJyb3I7XG5cdFx0fSk7XG59O1xuYDtcblxuY29uc3QgY29uZmlnTmF2aWdhdGlvbkhhbmRsZXIgPSBgXG5pZiAod2luZG93Lm5hdmlnYXRpb24gJiYgd2luZG93LnNlbGYgIT09IHdpbmRvdy50b3ApIHtcblx0d2luZG93Lm5hdmlnYXRpb24uYWRkRXZlbnRMaXN0ZW5lcignbmF2aWdhdGUnLCAoZXZlbnQpID0+IHtcblx0XHRjb25zdCB1cmwgPSBldmVudC5kZXN0aW5hdGlvbi51cmw7XG5cblx0XHR0cnkge1xuXHRcdFx0Y29uc3QgZGVzdGluYXRpb25VcmwgPSBuZXcgVVJMKHVybCk7XG5cdFx0XHRjb25zdCBkZXN0aW5hdGlvbk9yaWdpbiA9IGRlc3RpbmF0aW9uVXJsLm9yaWdpbjtcblx0XHRcdGNvbnN0IGN1cnJlbnRPcmlnaW4gPSB3aW5kb3cubG9jYXRpb24ub3JpZ2luO1xuXG5cdFx0XHRpZiAoZGVzdGluYXRpb25PcmlnaW4gPT09IGN1cnJlbnRPcmlnaW4pIHtcblx0XHRcdFx0cmV0dXJuO1xuXHRcdFx0fVxuXHRcdH0gY2F0Y2ggKGVycm9yKSB7XG5cdFx0XHRyZXR1cm47XG5cdFx0fVxuXG5cdFx0d2luZG93LnBhcmVudC5wb3N0TWVzc2FnZSh7XG5cdFx0XHR0eXBlOiAnaG9yaXpvbnMtbmF2aWdhdGlvbi1lcnJvcicsXG5cdFx0XHR1cmwsXG5cdFx0fSwgJyonKTtcblx0fSk7XG59XG5gO1xuXG5jb25zdCBhZGRUcmFuc2Zvcm1JbmRleEh0bWwgPSB7XG5cdG5hbWU6ICdhZGQtdHJhbnNmb3JtLWluZGV4LWh0bWwnLFxuXHR0cmFuc2Zvcm1JbmRleEh0bWwoaHRtbCkge1xuXHRcdGNvbnN0IHRhZ3MgPSBbXG5cdFx0XHR7XG5cdFx0XHRcdHRhZzogJ3NjcmlwdCcsXG5cdFx0XHRcdGF0dHJzOiB7IHR5cGU6ICdtb2R1bGUnIH0sXG5cdFx0XHRcdGNoaWxkcmVuOiBjb25maWdIb3Jpem9uc1J1bnRpbWVFcnJvckhhbmRsZXIsXG5cdFx0XHRcdGluamVjdFRvOiAnaGVhZCcsXG5cdFx0XHR9LFxuXHRcdFx0e1xuXHRcdFx0XHR0YWc6ICdzY3JpcHQnLFxuXHRcdFx0XHRhdHRyczogeyB0eXBlOiAnbW9kdWxlJyB9LFxuXHRcdFx0XHRjaGlsZHJlbjogY29uZmlnSG9yaXpvbnNWaXRlRXJyb3JIYW5kbGVyLFxuXHRcdFx0XHRpbmplY3RUbzogJ2hlYWQnLFxuXHRcdFx0fSxcblx0XHRcdHtcblx0XHRcdFx0dGFnOiAnc2NyaXB0Jyxcblx0XHRcdFx0YXR0cnM6IHt0eXBlOiAnbW9kdWxlJ30sXG5cdFx0XHRcdGNoaWxkcmVuOiBjb25maWdIb3Jpem9uc0NvbnNvbGVFcnJvckhhbmRsZXIsXG5cdFx0XHRcdGluamVjdFRvOiAnaGVhZCcsXG5cdFx0XHR9LFxuXHRcdFx0e1xuXHRcdFx0XHR0YWc6ICdzY3JpcHQnLFxuXHRcdFx0XHRhdHRyczogeyB0eXBlOiAnbW9kdWxlJyB9LFxuXHRcdFx0XHRjaGlsZHJlbjogY29uZmlnV2luZG93RmV0Y2hNb25rZXlQYXRjaCxcblx0XHRcdFx0aW5qZWN0VG86ICdoZWFkJyxcblx0XHRcdH0sXG5cdFx0XHR7XG5cdFx0XHRcdHRhZzogJ3NjcmlwdCcsXG5cdFx0XHRcdGF0dHJzOiB7IHR5cGU6ICdtb2R1bGUnIH0sXG5cdFx0XHRcdGNoaWxkcmVuOiBjb25maWdOYXZpZ2F0aW9uSGFuZGxlcixcblx0XHRcdFx0aW5qZWN0VG86ICdoZWFkJyxcblx0XHRcdH0sXG5cdFx0XTtcblxuXHRcdGlmICghaXNEZXYgJiYgcHJvY2Vzcy5lbnYuVEVNUExBVEVfQkFOTkVSX1NDUklQVF9VUkwgJiYgcHJvY2Vzcy5lbnYuVEVNUExBVEVfUkVESVJFQ1RfVVJMKSB7XG5cdFx0XHR0YWdzLnB1c2goXG5cdFx0XHRcdHtcblx0XHRcdFx0XHR0YWc6ICdzY3JpcHQnLFxuXHRcdFx0XHRcdGF0dHJzOiB7XG5cdFx0XHRcdFx0XHRzcmM6IHByb2Nlc3MuZW52LlRFTVBMQVRFX0JBTk5FUl9TQ1JJUFRfVVJMLFxuXHRcdFx0XHRcdFx0J3RlbXBsYXRlLXJlZGlyZWN0LXVybCc6IHByb2Nlc3MuZW52LlRFTVBMQVRFX1JFRElSRUNUX1VSTCxcblx0XHRcdFx0XHR9LFxuXHRcdFx0XHRcdGluamVjdFRvOiAnaGVhZCcsXG5cdFx0XHRcdH1cblx0XHRcdCk7XG5cdFx0fVxuXG5cdFx0cmV0dXJuIHtcblx0XHRcdGh0bWwsXG5cdFx0XHR0YWdzLFxuXHRcdH07XG5cdH0sXG59O1xuXG5jb25zb2xlLndhcm4gPSAoKSA9PiB7fTtcblxuY29uc3QgbG9nZ2VyID0gY3JlYXRlTG9nZ2VyKClcbmNvbnN0IGxvZ2dlckVycm9yID0gbG9nZ2VyLmVycm9yXG5cbmxvZ2dlci5lcnJvciA9IChtc2csIG9wdGlvbnMpID0+IHtcblx0aWYgKG9wdGlvbnM/LmVycm9yPy50b1N0cmluZygpLmluY2x1ZGVzKCdDc3NTeW50YXhFcnJvcjogW3Bvc3Rjc3NdJykpIHtcblx0XHRyZXR1cm47XG5cdH1cblxuXHRsb2dnZXJFcnJvcihtc2csIG9wdGlvbnMpO1xufVxuXG5leHBvcnQgZGVmYXVsdCBkZWZpbmVDb25maWcoe1xuXHRiYXNlOiBcIi9cIixcblx0Y3VzdG9tTG9nZ2VyOiBsb2dnZXIsXG5cdHBsdWdpbnM6IFtcblx0XHQuLi4oaXNEZXYgPyBbaW5saW5lRWRpdFBsdWdpbigpLCBlZGl0TW9kZURldlBsdWdpbigpLCBpZnJhbWVSb3V0ZVJlc3RvcmF0aW9uUGx1Z2luKCksIHNlbGVjdGlvbk1vZGVQbHVnaW4oKV0gOiBbXSksXG5cdFx0cmVhY3QoKSxcblx0XHRhZGRUcmFuc2Zvcm1JbmRleEh0bWwsXG5cblx0XHQvLyBcdTI1MDBcdTI1MDAgUFdBIFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFxuXHRcdFZpdGVQV0Eoe1xuXHRcdFx0cmVnaXN0ZXJUeXBlOiAnYXV0b1VwZGF0ZScsXG5cdFx0XHRpbmNsdWRlQXNzZXRzOiBbXG5cdFx0XHRcdCdmYXZpY29uLTE2eDE2LnBuZycsXG5cdFx0XHRcdCdmYXZpY29uLTMyeDMyLnBuZycsXG5cdFx0XHRcdCdhcHBsZS10b3VjaC1pY29uLnBuZycsXG5cdFx0XHRdLFxuXHRcdFx0bWFuaWZlc3Q6IHtcblx0XHRcdFx0bmFtZTogJ1RyYWRlQU1YIC0gRnVuZGluZyBUb21vcnJvd1xcJ3MgVHJhZGVycycsXG5cdFx0XHRcdHNob3J0X25hbWU6ICdUcmFkZUFNWCcsXG5cdFx0XHRcdGRlc2NyaXB0aW9uOiAnXHUwMERBbmV0ZSBhIFRyYWRlQU1YLCBsYSBwcm9wIGZpcm0gbFx1MDBFRGRlciBlbiB0cmFkaW5nLiBPYnRcdTAwRTluIGNhcGl0YWwgZGUgaGFzdGEgJDEwMGsgcGFyYSBvcGVyYXIgZW4gbG9zIG1lcmNhZG9zIGZpbmFuY2llcm9zLicsXG5cdFx0XHRcdHRoZW1lX2NvbG9yOiAnIzBmMTcyYScsXG5cdFx0XHRcdGJhY2tncm91bmRfY29sb3I6ICcjMGYxNzJhJyxcblx0XHRcdFx0ZGlzcGxheTogJ3N0YW5kYWxvbmUnLFxuXHRcdFx0XHRvcmllbnRhdGlvbjogJ3BvcnRyYWl0Jyxcblx0XHRcdFx0c2NvcGU6ICcvJyxcblx0XHRcdFx0c3RhcnRfdXJsOiAnLycsXG5cdFx0XHRcdGljb25zOiBbXG5cdFx0XHRcdFx0eyBzcmM6ICcvaWNvbnMvaWNvbi03Mng3Mi5wbmcnLCAgIHNpemVzOiAnNzJ4NzInLCAgIHR5cGU6ICdpbWFnZS9wbmcnIH0sXG5cdFx0XHRcdFx0eyBzcmM6ICcvaWNvbnMvaWNvbi05Nng5Ni5wbmcnLCAgIHNpemVzOiAnOTZ4OTYnLCAgIHR5cGU6ICdpbWFnZS9wbmcnIH0sXG5cdFx0XHRcdFx0eyBzcmM6ICcvaWNvbnMvaWNvbi0xMjh4MTI4LnBuZycsIHNpemVzOiAnMTI4eDEyOCcsIHR5cGU6ICdpbWFnZS9wbmcnIH0sXG5cdFx0XHRcdFx0eyBzcmM6ICcvaWNvbnMvaWNvbi0xNDR4MTQ0LnBuZycsIHNpemVzOiAnMTQ0eDE0NCcsIHR5cGU6ICdpbWFnZS9wbmcnIH0sXG5cdFx0XHRcdFx0eyBzcmM6ICcvaWNvbnMvaWNvbi0xNTJ4MTUyLnBuZycsIHNpemVzOiAnMTUyeDE1MicsIHR5cGU6ICdpbWFnZS9wbmcnIH0sXG5cdFx0XHRcdFx0eyBzcmM6ICcvaWNvbnMvaWNvbi0xOTJ4MTkyLnBuZycsIHNpemVzOiAnMTkyeDE5MicsIHR5cGU6ICdpbWFnZS9wbmcnLCBwdXJwb3NlOiAnYW55JyB9LFxuXHRcdFx0XHRcdHsgc3JjOiAnL2ljb25zL2ljb24tMzg0eDM4NC5wbmcnLCBzaXplczogJzM4NHgzODQnLCB0eXBlOiAnaW1hZ2UvcG5nJyB9LFxuXHRcdFx0XHRcdHsgc3JjOiAnL2ljb25zL2ljb24tNTEyeDUxMi5wbmcnLCBzaXplczogJzUxMng1MTInLCB0eXBlOiAnaW1hZ2UvcG5nJywgcHVycG9zZTogJ2FueScgfSxcblx0XHRcdFx0XHR7IHNyYzogJy9pY29ucy9tYXNrYWJsZS1pY29uLTUxMng1MTIucG5nJywgc2l6ZXM6ICc1MTJ4NTEyJywgdHlwZTogJ2ltYWdlL3BuZycsIHB1cnBvc2U6ICdtYXNrYWJsZScgfSxcblx0XHRcdFx0XSxcblx0XHRcdH0sXG5cdFx0XHR3b3JrYm94OiB7XG5cdFx0XHRcdC8vIE5vIGNhY2hlYXIgbGxhbWFkYXMgYSBTdXBhYmFzZSBuaSBBUElzIGRlIHByZWNpb3MgXHUyMDE0IHNpZW1wcmUgZnJlc2Nhc1xuXHRcdFx0XHRuYXZpZ2F0ZUZhbGxiYWNrRGVueWxpc3Q6IFsvXlxcL2FkbWluLywgL15cXC9hcGkvXSxcblx0XHRcdFx0cnVudGltZUNhY2hpbmc6IFtcblx0XHRcdFx0XHR7XG5cdFx0XHRcdFx0XHR1cmxQYXR0ZXJuOiAvXmh0dHBzOlxcL1xcLy4qXFwuc3VwYWJhc2VcXC5jb1xcLy4qL2ksXG5cdFx0XHRcdFx0XHRoYW5kbGVyOiAnTmV0d29ya09ubHknLFxuXHRcdFx0XHRcdH0sXG5cdFx0XHRcdFx0e1xuXHRcdFx0XHRcdFx0dXJsUGF0dGVybjogL1xcLig/OnBuZ3xqcGd8anBlZ3xzdmd8Z2lmfHdlYnApJC8sXG5cdFx0XHRcdFx0XHRoYW5kbGVyOiAnQ2FjaGVGaXJzdCcsXG5cdFx0XHRcdFx0XHRvcHRpb25zOiB7XG5cdFx0XHRcdFx0XHRcdGNhY2hlTmFtZTogJ2ltYWdlcy1jYWNoZScsXG5cdFx0XHRcdFx0XHRcdGV4cGlyYXRpb246IHsgbWF4RW50cmllczogNjAsIG1heEFnZVNlY29uZHM6IDMwICogMjQgKiA2MCAqIDYwIH0sXG5cdFx0XHRcdFx0XHR9LFxuXHRcdFx0XHRcdH0sXG5cdFx0XHRcdF0sXG5cdFx0XHR9LFxuXHRcdFx0ZGV2T3B0aW9uczoge1xuXHRcdFx0XHRlbmFibGVkOiBmYWxzZSwgLy8gZXZpdGEgY29uZmxpY3RvcyBjb24gZWwgdmlzdWFsIGVkaXRvciBlbiBkZXZcblx0XHRcdH0sXG5cdFx0fSksXG5cdF0sXG5cdHNlcnZlcjoge1xuXHRcdGNvcnM6IHRydWUsXG5cdFx0aGVhZGVyczoge1xuXHRcdFx0J0Nyb3NzLU9yaWdpbi1FbWJlZGRlci1Qb2xpY3knOiAnY3JlZGVudGlhbGxlc3MnLFxuXHRcdH0sXG5cdFx0YWxsb3dlZEhvc3RzOiB0cnVlLFxuXHR9LFxuXHRyZXNvbHZlOiB7XG5cdFx0ZXh0ZW5zaW9uczogWycuanN4JywgJy5qcycsICcudHN4JywgJy50cycsICcuanNvbicsIF0sXG5cdFx0YWxpYXM6IHtcblx0XHRcdCdAJzogcGF0aC5yZXNvbHZlKF9fZGlybmFtZSwgJy4vc3JjJyksXG5cdFx0fSxcblx0fSxcblx0YnVpbGQ6IHtcblx0XHRyb2xsdXBPcHRpb25zOiB7XG5cdFx0XHRleHRlcm5hbDogW1xuXHRcdFx0XHQnQGJhYmVsL3BhcnNlcicsXG5cdFx0XHRcdCdAYmFiZWwvdHJhdmVyc2UnLFxuXHRcdFx0XHQnQGJhYmVsL2dlbmVyYXRvcicsXG5cdFx0XHRcdCdAYmFiZWwvdHlwZXMnXG5cdFx0XHRdXG5cdFx0fVxuXHR9XG59KTsiLCAiY29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2Rpcm5hbWUgPSBcIkM6XFxcXFVzZXJzXFxcXEphem1pbiBSZXllcyBHcmlzXFxcXFByb3llY3RvXFxcXHByb3llY3Rvc1xcXFxUcmFkZWFteC1wbGF0YWZvcm1hXFxcXHBsdWdpbnNcXFxcdmlzdWFsLWVkaXRvclwiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9maWxlbmFtZSA9IFwiQzpcXFxcVXNlcnNcXFxcSmF6bWluIFJleWVzIEdyaXNcXFxcUHJveWVjdG9cXFxccHJveWVjdG9zXFxcXFRyYWRlYW14LXBsYXRhZm9ybWFcXFxccGx1Z2luc1xcXFx2aXN1YWwtZWRpdG9yXFxcXHZpdGUtcGx1Z2luLXJlYWN0LWlubGluZS1lZGl0b3IuanNcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfaW1wb3J0X21ldGFfdXJsID0gXCJmaWxlOi8vL0M6L1VzZXJzL0phem1pbiUyMFJleWVzJTIwR3Jpcy9Qcm95ZWN0by9wcm95ZWN0b3MvVHJhZGVhbXgtcGxhdGFmb3JtYS9wbHVnaW5zL3Zpc3VhbC1lZGl0b3Ivdml0ZS1wbHVnaW4tcmVhY3QtaW5saW5lLWVkaXRvci5qc1wiO2ltcG9ydCBwYXRoIGZyb20gJ3BhdGgnO1xuaW1wb3J0IHsgcGFyc2UgfSBmcm9tICdAYmFiZWwvcGFyc2VyJztcbmltcG9ydCB0cmF2ZXJzZUJhYmVsIGZyb20gJ0BiYWJlbC90cmF2ZXJzZSc7XG5pbXBvcnQgKiBhcyB0IGZyb20gJ0BiYWJlbC90eXBlcyc7XG5pbXBvcnQgZnMgZnJvbSAnZnMnO1xuaW1wb3J0IHsgXG5cdHZhbGlkYXRlRmlsZVBhdGgsIFxuXHRwYXJzZUZpbGVUb0FTVCwgXG5cdGZpbmRKU1hFbGVtZW50QXRQb3NpdGlvbixcblx0Z2VuZXJhdGVDb2RlLFxuXHRnZW5lcmF0ZVNvdXJjZVdpdGhNYXAsXG5cdFZJVEVfUFJPSkVDVF9ST09UXG59IGZyb20gJy4uL3V0aWxzL2FzdC11dGlscy5qcyc7XG5cbmNvbnN0IEVESVRBQkxFX0pTWF9UQUdTID0gW1wiYVwiLCBcIkxpbmtcIiwgXCJidXR0b25cIiwgXCJCdXR0b25cIiwgXCJwXCIsIFwic3BhblwiLCBcImgxXCIsIFwiaDJcIiwgXCJoM1wiLCBcImg0XCIsIFwiaDVcIiwgXCJoNlwiLCBcImxhYmVsXCIsIFwiTGFiZWxcIiwgXCJpbWdcIl07XG5cbmZ1bmN0aW9uIHBhcnNlRWRpdElkKGVkaXRJZCkge1xuXHRjb25zdCBwYXJ0cyA9IGVkaXRJZC5zcGxpdCgnOicpO1xuXG5cdGlmIChwYXJ0cy5sZW5ndGggPCAzKSB7XG5cdFx0cmV0dXJuIG51bGw7XG5cdH1cblxuXHRjb25zdCBjb2x1bW4gPSBwYXJzZUludChwYXJ0cy5hdCgtMSksIDEwKTtcblx0Y29uc3QgbGluZSA9IHBhcnNlSW50KHBhcnRzLmF0KC0yKSwgMTApO1xuXHRjb25zdCBmaWxlUGF0aCA9IHBhcnRzLnNsaWNlKDAsIC0yKS5qb2luKCc6Jyk7XG5cblx0aWYgKCFmaWxlUGF0aCB8fCBpc05hTihsaW5lKSB8fCBpc05hTihjb2x1bW4pKSB7XG5cdFx0cmV0dXJuIG51bGw7XG5cdH1cblxuXHRyZXR1cm4geyBmaWxlUGF0aCwgbGluZSwgY29sdW1uIH07XG59XG5cbmZ1bmN0aW9uIGNoZWNrVGFnTmFtZUVkaXRhYmxlKG9wZW5pbmdFbGVtZW50Tm9kZSwgZWRpdGFibGVUYWdzTGlzdCA9IEVESVRBQkxFX0pTWF9UQUdTKSB7XG5cdGlmICghb3BlbmluZ0VsZW1lbnROb2RlIHx8ICFvcGVuaW5nRWxlbWVudE5vZGUubmFtZSkgcmV0dXJuIGZhbHNlO1xuXHRjb25zdCBuYW1lTm9kZSA9IG9wZW5pbmdFbGVtZW50Tm9kZS5uYW1lO1xuXG5cdC8vIENoZWNrIDE6IERpcmVjdCBuYW1lIChmb3IgPHA+LCA8QnV0dG9uPilcblx0aWYgKG5hbWVOb2RlLnR5cGUgPT09ICdKU1hJZGVudGlmaWVyJyAmJiBlZGl0YWJsZVRhZ3NMaXN0LmluY2x1ZGVzKG5hbWVOb2RlLm5hbWUpKSB7XG5cdFx0cmV0dXJuIHRydWU7XG5cdH1cblxuXHQvLyBDaGVjayAyOiBQcm9wZXJ0eSBuYW1lIG9mIGEgbWVtYmVyIGV4cHJlc3Npb24gKGZvciA8bW90aW9uLmgxPiwgY2hlY2sgaWYgXCJoMVwiIGlzIGluIGVkaXRhYmxlVGFnc0xpc3QpXG5cdGlmIChuYW1lTm9kZS50eXBlID09PSAnSlNYTWVtYmVyRXhwcmVzc2lvbicgJiYgbmFtZU5vZGUucHJvcGVydHkgJiYgbmFtZU5vZGUucHJvcGVydHkudHlwZSA9PT0gJ0pTWElkZW50aWZpZXInICYmIGVkaXRhYmxlVGFnc0xpc3QuaW5jbHVkZXMobmFtZU5vZGUucHJvcGVydHkubmFtZSkpIHtcblx0XHRyZXR1cm4gdHJ1ZTtcblx0fVxuXG5cdHJldHVybiBmYWxzZTtcbn1cblxuZnVuY3Rpb24gdmFsaWRhdGVJbWFnZVNyYyhvcGVuaW5nTm9kZSkge1xuXHRpZiAoIW9wZW5pbmdOb2RlIHx8ICFvcGVuaW5nTm9kZS5uYW1lIHx8ICggb3BlbmluZ05vZGUubmFtZS5uYW1lICE9PSAnaW1nJyAmJiBvcGVuaW5nTm9kZS5uYW1lLnByb3BlcnR5Py5uYW1lICE9PSAnaW1nJykpIHtcblx0XHRyZXR1cm4geyBpc1ZhbGlkOiB0cnVlLCByZWFzb246IG51bGwgfTsgLy8gTm90IGFuIGltYWdlLCBza2lwIHZhbGlkYXRpb25cblx0fVxuXG5cdGNvbnN0IGhhc1Byb3BzU3ByZWFkID0gb3BlbmluZ05vZGUuYXR0cmlidXRlcy5zb21lKGF0dHIgPT5cblx0XHR0LmlzSlNYU3ByZWFkQXR0cmlidXRlKGF0dHIpICYmXG5cdFx0YXR0ci5hcmd1bWVudCAmJlxuXHRcdHQuaXNJZGVudGlmaWVyKGF0dHIuYXJndW1lbnQpICYmXG5cdFx0YXR0ci5hcmd1bWVudC5uYW1lID09PSAncHJvcHMnXG5cdCk7XG5cblx0aWYgKGhhc1Byb3BzU3ByZWFkKSB7XG5cdFx0cmV0dXJuIHsgaXNWYWxpZDogZmFsc2UsIHJlYXNvbjogJ3Byb3BzLXNwcmVhZCcgfTtcblx0fVxuXG5cdGNvbnN0IHNyY0F0dHIgPSBvcGVuaW5nTm9kZS5hdHRyaWJ1dGVzLmZpbmQoYXR0ciA9PlxuXHRcdHQuaXNKU1hBdHRyaWJ1dGUoYXR0cikgJiZcblx0XHRhdHRyLm5hbWUgJiZcblx0XHRhdHRyLm5hbWUubmFtZSA9PT0gJ3NyYydcblx0KTtcblxuXHRpZiAoIXNyY0F0dHIpIHtcblx0XHRyZXR1cm4geyBpc1ZhbGlkOiBmYWxzZSwgcmVhc29uOiAnbWlzc2luZy1zcmMnIH07XG5cdH1cblxuXHRpZiAoIXQuaXNTdHJpbmdMaXRlcmFsKHNyY0F0dHIudmFsdWUpKSB7XG5cdFx0cmV0dXJuIHsgaXNWYWxpZDogZmFsc2UsIHJlYXNvbjogJ2R5bmFtaWMtc3JjJyB9O1xuXHR9XG5cblx0aWYgKCFzcmNBdHRyLnZhbHVlLnZhbHVlIHx8IHNyY0F0dHIudmFsdWUudmFsdWUudHJpbSgpID09PSAnJykge1xuXHRcdHJldHVybiB7IGlzVmFsaWQ6IGZhbHNlLCByZWFzb246ICdlbXB0eS1zcmMnIH07XG5cdH1cblxuXHRyZXR1cm4geyBpc1ZhbGlkOiB0cnVlLCByZWFzb246IG51bGwgfTtcbn1cblxuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24gaW5saW5lRWRpdFBsdWdpbigpIHtcblx0cmV0dXJuIHtcblx0XHRuYW1lOiAndml0ZS1pbmxpbmUtZWRpdC1wbHVnaW4nLFxuXHRcdGVuZm9yY2U6ICdwcmUnLFxuXG5cdFx0dHJhbnNmb3JtKGNvZGUsIGlkKSB7XG5cdFx0XHRpZiAoIS9cXC4oanN4fHRzeCkkLy50ZXN0KGlkKSB8fCAhaWQuc3RhcnRzV2l0aChWSVRFX1BST0pFQ1RfUk9PVCkgfHwgaWQuaW5jbHVkZXMoJ25vZGVfbW9kdWxlcycpKSB7XG5cdFx0XHRcdHJldHVybiBudWxsO1xuXHRcdFx0fVxuXG5cdFx0XHRjb25zdCByZWxhdGl2ZUZpbGVQYXRoID0gcGF0aC5yZWxhdGl2ZShWSVRFX1BST0pFQ1RfUk9PVCwgaWQpO1xuXHRcdFx0Y29uc3Qgd2ViUmVsYXRpdmVGaWxlUGF0aCA9IHJlbGF0aXZlRmlsZVBhdGguc3BsaXQocGF0aC5zZXApLmpvaW4oJy8nKTtcblxuXHRcdFx0dHJ5IHtcblx0XHRcdFx0Y29uc3QgYmFiZWxBc3QgPSBwYXJzZShjb2RlLCB7XG5cdFx0XHRcdFx0c291cmNlVHlwZTogJ21vZHVsZScsXG5cdFx0XHRcdFx0cGx1Z2luczogWydqc3gnLCAndHlwZXNjcmlwdCddLFxuXHRcdFx0XHRcdGVycm9yUmVjb3Zlcnk6IHRydWVcblx0XHRcdFx0fSk7XG5cblx0XHRcdFx0bGV0IGF0dHJpYnV0ZXNBZGRlZCA9IDA7XG5cblx0XHRcdFx0dHJhdmVyc2VCYWJlbC5kZWZhdWx0KGJhYmVsQXN0LCB7XG5cdFx0XHRcdFx0ZW50ZXIocGF0aCkge1xuXHRcdFx0XHRcdFx0aWYgKHBhdGguaXNKU1hPcGVuaW5nRWxlbWVudCgpKSB7XG5cdFx0XHRcdFx0XHRcdGNvbnN0IG9wZW5pbmdOb2RlID0gcGF0aC5ub2RlO1xuXHRcdFx0XHRcdFx0XHRjb25zdCBlbGVtZW50Tm9kZSA9IHBhdGgucGFyZW50UGF0aC5ub2RlOyAvLyBUaGUgSlNYRWxlbWVudCBpdHNlbGZcblxuXHRcdFx0XHRcdFx0XHRpZiAoIW9wZW5pbmdOb2RlLmxvYykge1xuXHRcdFx0XHRcdFx0XHRcdHJldHVybjtcblx0XHRcdFx0XHRcdFx0fVxuXG5cdFx0XHRcdFx0XHRcdGNvbnN0IGFscmVhZHlIYXNJZCA9IG9wZW5pbmdOb2RlLmF0dHJpYnV0ZXMuc29tZShcblx0XHRcdFx0XHRcdFx0XHQoYXR0cikgPT4gdC5pc0pTWEF0dHJpYnV0ZShhdHRyKSAmJiBhdHRyLm5hbWUubmFtZSA9PT0gJ2RhdGEtZWRpdC1pZCdcblx0XHRcdFx0XHRcdFx0KTtcblxuXHRcdFx0XHRcdFx0XHRpZiAoYWxyZWFkeUhhc0lkKSB7XG5cdFx0XHRcdFx0XHRcdFx0cmV0dXJuO1xuXHRcdFx0XHRcdFx0XHR9XG5cblx0XHRcdFx0XHRcdFx0Ly8gQ29uZGl0aW9uIDE6IElzIHRoZSBjdXJyZW50IGVsZW1lbnQgdGFnIHR5cGUgZWRpdGFibGU/XG5cdFx0XHRcdFx0XHRcdGNvbnN0IGlzQ3VycmVudEVsZW1lbnRFZGl0YWJsZSA9IGNoZWNrVGFnTmFtZUVkaXRhYmxlKG9wZW5pbmdOb2RlLCBFRElUQUJMRV9KU1hfVEFHUyk7XG5cdFx0XHRcdFx0XHRcdGlmICghaXNDdXJyZW50RWxlbWVudEVkaXRhYmxlKSB7XG5cdFx0XHRcdFx0XHRcdFx0cmV0dXJuO1xuXHRcdFx0XHRcdFx0XHR9XG5cblx0XHRcdFx0XHRcdFx0Y29uc3QgaW1hZ2VWYWxpZGF0aW9uID0gdmFsaWRhdGVJbWFnZVNyYyhvcGVuaW5nTm9kZSk7XG5cdFx0XHRcdFx0XHRcdGlmICghaW1hZ2VWYWxpZGF0aW9uLmlzVmFsaWQpIHtcblx0XHRcdFx0XHRcdFx0XHRjb25zdCBkaXNhYmxlZEF0dHJpYnV0ZSA9IHQuanN4QXR0cmlidXRlKFxuXHRcdFx0XHRcdFx0XHRcdFx0dC5qc3hJZGVudGlmaWVyKCdkYXRhLWVkaXQtZGlzYWJsZWQnKSxcblx0XHRcdFx0XHRcdFx0XHRcdHQuc3RyaW5nTGl0ZXJhbCgndHJ1ZScpXG5cdFx0XHRcdFx0XHRcdFx0KTtcblx0XHRcdFx0XHRcdFx0XHRvcGVuaW5nTm9kZS5hdHRyaWJ1dGVzLnB1c2goZGlzYWJsZWRBdHRyaWJ1dGUpO1xuXHRcdFx0XHRcdFx0XHRcdGF0dHJpYnV0ZXNBZGRlZCsrO1xuXHRcdFx0XHRcdFx0XHRcdHJldHVybjtcblx0XHRcdFx0XHRcdFx0fVxuXG5cdFx0XHRcdFx0XHRcdGxldCBzaG91bGRCZURpc2FibGVkRHVlVG9DaGlsZHJlbiA9IGZhbHNlO1xuXG5cdFx0XHRcdFx0XHRcdC8vIENvbmRpdGlvbiAyOiBEb2VzIHRoZSBlbGVtZW50IGhhdmUgZHluYW1pYyBvciBlZGl0YWJsZSBjaGlsZHJlblxuXHRcdFx0XHRcdFx0XHRpZiAodC5pc0pTWEVsZW1lbnQoZWxlbWVudE5vZGUpICYmIGVsZW1lbnROb2RlLmNoaWxkcmVuKSB7XG5cdFx0XHRcdFx0XHRcdFx0Ly8gQ2hlY2sgaWYgZWxlbWVudCBoYXMgey4uLnByb3BzfSBzcHJlYWQgYXR0cmlidXRlIC0gZGlzYWJsZSBlZGl0aW5nIGlmIGl0IGRvZXNcblx0XHRcdFx0XHRcdFx0XHRjb25zdCBoYXNQcm9wc1NwcmVhZCA9IG9wZW5pbmdOb2RlLmF0dHJpYnV0ZXMuc29tZShhdHRyID0+IHQuaXNKU1hTcHJlYWRBdHRyaWJ1dGUoYXR0cilcblx0XHRcdFx0XHRcdFx0XHRcdCYmIGF0dHIuYXJndW1lbnRcblx0XHRcdFx0XHRcdFx0XHRcdCYmIHQuaXNJZGVudGlmaWVyKGF0dHIuYXJndW1lbnQpXG5cdFx0XHRcdFx0XHRcdFx0XHQmJiBhdHRyLmFyZ3VtZW50Lm5hbWUgPT09ICdwcm9wcydcblx0XHRcdFx0XHRcdFx0XHQpO1xuXG5cdFx0XHRcdFx0XHRcdFx0Y29uc3QgaGFzRHluYW1pY0NoaWxkID0gZWxlbWVudE5vZGUuY2hpbGRyZW4uc29tZShjaGlsZCA9PlxuXHRcdFx0XHRcdFx0XHRcdFx0dC5pc0pTWEV4cHJlc3Npb25Db250YWluZXIoY2hpbGQpXG5cdFx0XHRcdFx0XHRcdFx0KTtcblxuXHRcdFx0XHRcdFx0XHRcdGlmIChoYXNEeW5hbWljQ2hpbGQgfHwgaGFzUHJvcHNTcHJlYWQpIHtcblx0XHRcdFx0XHRcdFx0XHRcdHNob3VsZEJlRGlzYWJsZWREdWVUb0NoaWxkcmVuID0gdHJ1ZTtcblx0XHRcdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0XHRcdH1cblxuXHRcdFx0XHRcdFx0XHRpZiAoIXNob3VsZEJlRGlzYWJsZWREdWVUb0NoaWxkcmVuICYmIHQuaXNKU1hFbGVtZW50KGVsZW1lbnROb2RlKSAmJiBlbGVtZW50Tm9kZS5jaGlsZHJlbikge1xuXHRcdFx0XHRcdFx0XHRcdGNvbnN0IGhhc0VkaXRhYmxlSnN4Q2hpbGQgPSBlbGVtZW50Tm9kZS5jaGlsZHJlbi5zb21lKGNoaWxkID0+IHtcblx0XHRcdFx0XHRcdFx0XHRcdGlmICh0LmlzSlNYRWxlbWVudChjaGlsZCkpIHtcblx0XHRcdFx0XHRcdFx0XHRcdFx0cmV0dXJuIGNoZWNrVGFnTmFtZUVkaXRhYmxlKGNoaWxkLm9wZW5pbmdFbGVtZW50LCBFRElUQUJMRV9KU1hfVEFHUyk7XG5cdFx0XHRcdFx0XHRcdFx0XHR9XG5cblx0XHRcdFx0XHRcdFx0XHRcdHJldHVybiBmYWxzZTtcblx0XHRcdFx0XHRcdFx0XHR9KTtcblxuXHRcdFx0XHRcdFx0XHRcdGlmIChoYXNFZGl0YWJsZUpzeENoaWxkKSB7XG5cdFx0XHRcdFx0XHRcdFx0XHRzaG91bGRCZURpc2FibGVkRHVlVG9DaGlsZHJlbiA9IHRydWU7XG5cdFx0XHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdFx0XHR9XG5cblx0XHRcdFx0XHRcdFx0aWYgKHNob3VsZEJlRGlzYWJsZWREdWVUb0NoaWxkcmVuKSB7XG5cdFx0XHRcdFx0XHRcdFx0Y29uc3QgZGlzYWJsZWRBdHRyaWJ1dGUgPSB0LmpzeEF0dHJpYnV0ZShcblx0XHRcdFx0XHRcdFx0XHRcdHQuanN4SWRlbnRpZmllcignZGF0YS1lZGl0LWRpc2FibGVkJyksXG5cdFx0XHRcdFx0XHRcdFx0XHR0LnN0cmluZ0xpdGVyYWwoJ3RydWUnKVxuXHRcdFx0XHRcdFx0XHRcdCk7XG5cblx0XHRcdFx0XHRcdFx0XHRvcGVuaW5nTm9kZS5hdHRyaWJ1dGVzLnB1c2goZGlzYWJsZWRBdHRyaWJ1dGUpO1xuXHRcdFx0XHRcdFx0XHRcdGF0dHJpYnV0ZXNBZGRlZCsrO1xuXHRcdFx0XHRcdFx0XHRcdHJldHVybjtcblx0XHRcdFx0XHRcdFx0fVxuXG5cdFx0XHRcdFx0XHRcdC8vIENvbmRpdGlvbiAzOiBQYXJlbnQgaXMgbm9uLWVkaXRhYmxlIGlmIGl0IGhhcyBub24tZWRpdGFibGUsIG5vbi1pY29uIEpTWCBjaGlsZHJlbi5cblx0XHRcdFx0XHRcdFx0aWYgKHQuaXNKU1hFbGVtZW50KGVsZW1lbnROb2RlKSAmJiBlbGVtZW50Tm9kZS5jaGlsZHJlbiAmJiBlbGVtZW50Tm9kZS5jaGlsZHJlbi5sZW5ndGggPiAwKSB7XG5cdFx0XHRcdFx0XHRcdFx0bGV0IGhhc1RleHRDb250ZW50ID0gZmFsc2U7XG5cdFx0XHRcdFx0XHRcdFx0bGV0IGhhc05vbkVkaXRhYmxlSnN4Q2hpbGQgPSBmYWxzZTtcblx0XHRcdFx0XHRcdFx0XHRsZXQgaGFzTm9uU2VsZkNsb3NpbmdDaGlsZCA9IGZhbHNlO1xuXG5cdFx0XHRcdFx0XHRcdFx0Zm9yIChjb25zdCBjaGlsZCBvZiBlbGVtZW50Tm9kZS5jaGlsZHJlbikge1xuXHRcdFx0XHRcdFx0XHRcdFx0aWYgKHQuaXNKU1hUZXh0KGNoaWxkKSkge1xuXHRcdFx0XHRcdFx0XHRcdFx0XHRpZiAoY2hpbGQudmFsdWUudHJpbSgpLmxlbmd0aCA+IDApIGhhc1RleHRDb250ZW50ID0gdHJ1ZTtcblx0XHRcdFx0XHRcdFx0XHRcdFx0Y29udGludWU7XG5cdFx0XHRcdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0XHRcdFx0aWYgKHQuaXNKU1hFbGVtZW50KGNoaWxkKSkge1xuXHRcdFx0XHRcdFx0XHRcdFx0Y29uc3QgY2hpbGROb2RlID0gY2hpbGQub3BlbmluZ0VsZW1lbnQ7XG5cdFx0XHRcdFx0XHRcdFx0XHRpZiAoY2hpbGROb2RlLnNlbGZDbG9zaW5nKSB7XG5cdFx0XHRcdFx0XHRcdFx0XHRcdGNvbnN0IGNoaWxkTmFtZSA9IGNoaWxkTm9kZS5uYW1lPy5uYW1lIHx8ICcnO1xuXHRcdFx0XHRcdFx0XHRcdFx0XHRpZiAoIS9eW0EtWl0vLnRlc3QoY2hpbGROYW1lKSAmJiAhY2hlY2tUYWdOYW1lRWRpdGFibGUoY2hpbGROb2RlLCBFRElUQUJMRV9KU1hfVEFHUykpIHtcblx0XHRcdFx0XHRcdFx0XHRcdFx0XHRoYXNOb25FZGl0YWJsZUpzeENoaWxkID0gdHJ1ZTtcblx0XHRcdFx0XHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdFx0XHRcdFx0XHRjb250aW51ZTtcblx0XHRcdFx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHRcdFx0XHRcdGhhc05vblNlbGZDbG9zaW5nQ2hpbGQgPSB0cnVlO1xuXHRcdFx0XHRcdFx0XHRcdFx0aWYgKCFjaGVja1RhZ05hbWVFZGl0YWJsZShjaGlsZE5vZGUsIEVESVRBQkxFX0pTWF9UQUdTKSkge1xuXHRcdFx0XHRcdFx0XHRcdFx0XHRoYXNOb25FZGl0YWJsZUpzeENoaWxkID0gdHJ1ZTtcblx0XHRcdFx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0XHRcdFx0fVxuXG5cdFx0XHRcdFx0XHRcdFx0aWYgKCFoYXNUZXh0Q29udGVudCAmJiAhaGFzTm9uU2VsZkNsb3NpbmdDaGlsZCkgcmV0dXJuO1xuXG5cdFx0XHRcdFx0XHRcdFx0aWYgKGhhc05vbkVkaXRhYmxlSnN4Q2hpbGQpIHtcblx0XHRcdFx0XHRcdFx0XHRcdGNvbnN0IGRpc2FibGVkQXR0cmlidXRlID0gdC5qc3hBdHRyaWJ1dGUoXG5cdFx0XHRcdFx0XHRcdFx0XHRcdHQuanN4SWRlbnRpZmllcignZGF0YS1lZGl0LWRpc2FibGVkJyksXG5cdFx0XHRcdFx0XHRcdFx0XHRcdHQuc3RyaW5nTGl0ZXJhbChcInRydWVcIilcblx0XHRcdFx0XHRcdFx0XHRcdCk7XG5cdFx0XHRcdFx0XHRcdFx0XHRvcGVuaW5nTm9kZS5hdHRyaWJ1dGVzLnB1c2goZGlzYWJsZWRBdHRyaWJ1dGUpO1xuXHRcdFx0XHRcdFx0XHRcdFx0YXR0cmlidXRlc0FkZGVkKys7XG5cdFx0XHRcdFx0XHRcdFx0XHRyZXR1cm47XG5cdFx0XHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdFx0XHR9XG5cblx0XHRcdFx0XHRcdFx0Ly8gQ29uZGl0aW9uIDQ6IElzIGFueSBhbmNlc3RvciBKU1hFbGVtZW50IGFsc28gZWRpdGFibGU/XG5cdFx0XHRcdFx0XHRcdGxldCBjdXJyZW50QW5jZXN0b3JDYW5kaWRhdGVQYXRoID0gcGF0aC5wYXJlbnRQYXRoLnBhcmVudFBhdGg7XG5cdFx0XHRcdFx0XHRcdHdoaWxlIChjdXJyZW50QW5jZXN0b3JDYW5kaWRhdGVQYXRoKSB7XG5cdFx0XHRcdFx0XHRcdFx0Y29uc3QgYW5jZXN0b3JKc3hFbGVtZW50UGF0aCA9IGN1cnJlbnRBbmNlc3RvckNhbmRpZGF0ZVBhdGguaXNKU1hFbGVtZW50KClcblx0XHRcdFx0XHRcdFx0XHRcdD8gY3VycmVudEFuY2VzdG9yQ2FuZGlkYXRlUGF0aFxuXHRcdFx0XHRcdFx0XHRcdFx0OiBjdXJyZW50QW5jZXN0b3JDYW5kaWRhdGVQYXRoLmZpbmRQYXJlbnQocCA9PiBwLmlzSlNYRWxlbWVudCgpKTtcblxuXHRcdFx0XHRcdFx0XHRcdGlmICghYW5jZXN0b3JKc3hFbGVtZW50UGF0aCkge1xuXHRcdFx0XHRcdFx0XHRcdFx0YnJlYWs7XG5cdFx0XHRcdFx0XHRcdFx0fVxuXG5cdFx0XHRcdFx0XHRcdFx0aWYgKGNoZWNrVGFnTmFtZUVkaXRhYmxlKGFuY2VzdG9ySnN4RWxlbWVudFBhdGgubm9kZS5vcGVuaW5nRWxlbWVudCwgRURJVEFCTEVfSlNYX1RBR1MpKSB7XG5cdFx0XHRcdFx0XHRcdFx0XHRyZXR1cm47XG5cdFx0XHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdFx0XHRcdGN1cnJlbnRBbmNlc3RvckNhbmRpZGF0ZVBhdGggPSBhbmNlc3RvckpzeEVsZW1lbnRQYXRoLnBhcmVudFBhdGg7XG5cdFx0XHRcdFx0XHRcdH1cblxuXHRcdFx0XHRcdFx0XHRjb25zdCBsaW5lID0gb3BlbmluZ05vZGUubG9jLnN0YXJ0LmxpbmU7XG5cdFx0XHRcdFx0XHRcdGNvbnN0IGNvbHVtbiA9IG9wZW5pbmdOb2RlLmxvYy5zdGFydC5jb2x1bW4gKyAxO1xuXHRcdFx0XHRcdFx0XHRjb25zdCBlZGl0SWQgPSBgJHt3ZWJSZWxhdGl2ZUZpbGVQYXRofToke2xpbmV9OiR7Y29sdW1ufWA7XG5cblx0XHRcdFx0XHRcdFx0Y29uc3QgaWRBdHRyaWJ1dGUgPSB0LmpzeEF0dHJpYnV0ZShcblx0XHRcdFx0XHRcdFx0XHR0LmpzeElkZW50aWZpZXIoJ2RhdGEtZWRpdC1pZCcpLFxuXHRcdFx0XHRcdFx0XHRcdHQuc3RyaW5nTGl0ZXJhbChlZGl0SWQpXG5cdFx0XHRcdFx0XHRcdCk7XG5cblx0XHRcdFx0XHRcdFx0b3BlbmluZ05vZGUuYXR0cmlidXRlcy5wdXNoKGlkQXR0cmlidXRlKTtcblx0XHRcdFx0XHRcdFx0YXR0cmlidXRlc0FkZGVkKys7XG5cdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9KTtcblxuXHRcdFx0XHRpZiAoYXR0cmlidXRlc0FkZGVkID4gMCkge1xuXHRcdFx0XHRcdGNvbnN0IG91dHB1dCA9IGdlbmVyYXRlU291cmNlV2l0aE1hcChiYWJlbEFzdCwgd2ViUmVsYXRpdmVGaWxlUGF0aCwgY29kZSk7XG5cdFx0XHRcdFx0cmV0dXJuIHsgY29kZTogb3V0cHV0LmNvZGUsIG1hcDogb3V0cHV0Lm1hcCB9O1xuXHRcdFx0XHR9XG5cblx0XHRcdFx0cmV0dXJuIG51bGw7XG5cdFx0XHR9IGNhdGNoIChlcnJvcikge1xuXHRcdFx0XHRjb25zb2xlLmVycm9yKGBbdml0ZV1bdmlzdWFsLWVkaXRvcl0gRXJyb3IgdHJhbnNmb3JtaW5nICR7aWR9OmAsIGVycm9yKTtcblx0XHRcdFx0cmV0dXJuIG51bGw7XG5cdFx0XHR9XG5cdFx0fSxcblxuXG5cdFx0Ly8gVXBkYXRlcyBzb3VyY2UgY29kZSBiYXNlZCBvbiB0aGUgY2hhbmdlcyByZWNlaXZlZCBmcm9tIHRoZSBjbGllbnRcblx0XHRjb25maWd1cmVTZXJ2ZXIoc2VydmVyKSB7XG5cdFx0XHRzZXJ2ZXIubWlkZGxld2FyZXMudXNlKCcvYXBpL2FwcGx5LWVkaXQnLCBhc3luYyAocmVxLCByZXMsIG5leHQpID0+IHtcblx0XHRcdFx0aWYgKHJlcS5tZXRob2QgIT09ICdQT1NUJykgcmV0dXJuIG5leHQoKTtcblxuXHRcdFx0XHRsZXQgYm9keSA9ICcnO1xuXHRcdFx0XHRyZXEub24oJ2RhdGEnLCBjaHVuayA9PiB7IGJvZHkgKz0gY2h1bmsudG9TdHJpbmcoKTsgfSk7XG5cblx0XHRcdFx0cmVxLm9uKCdlbmQnLCBhc3luYyAoKSA9PiB7XG5cdFx0XHRcdFx0bGV0IGFic29sdXRlRmlsZVBhdGggPSAnJztcblx0XHRcdFx0XHR0cnkge1xuXHRcdFx0XHRcdFx0Y29uc3QgeyBlZGl0SWQsIG5ld0Z1bGxUZXh0IH0gPSBKU09OLnBhcnNlKGJvZHkpO1xuXG5cdFx0XHRcdFx0XHRpZiAoIWVkaXRJZCB8fCB0eXBlb2YgbmV3RnVsbFRleHQgPT09ICd1bmRlZmluZWQnKSB7XG5cdFx0XHRcdFx0XHRcdFx0cmVzLndyaXRlSGVhZCg0MDAsIHsgJ0NvbnRlbnQtVHlwZSc6ICdhcHBsaWNhdGlvbi9qc29uJyB9KTtcblx0XHRcdFx0XHRcdFx0cmV0dXJuIHJlcy5lbmQoSlNPTi5zdHJpbmdpZnkoeyBlcnJvcjogJ01pc3NpbmcgZWRpdElkIG9yIG5ld0Z1bGxUZXh0JyB9KSk7XG5cdFx0XHRcdFx0XHRcdH1cblxuXHRcdFx0XHRcdFx0XHRjb25zdCBwYXJzZWRJZCA9IHBhcnNlRWRpdElkKGVkaXRJZCk7XG5cdFx0XHRcdFx0XHRcdGlmICghcGFyc2VkSWQpIHtcblx0XHRcdFx0XHRcdFx0XHRyZXMud3JpdGVIZWFkKDQwMCwgeyAnQ29udGVudC1UeXBlJzogJ2FwcGxpY2F0aW9uL2pzb24nIH0pO1xuXHRcdFx0XHRcdFx0XHRcdHJldHVybiByZXMuZW5kKEpTT04uc3RyaW5naWZ5KHsgZXJyb3I6ICdJbnZhbGlkIGVkaXRJZCBmb3JtYXQgKGZpbGVQYXRoOmxpbmU6Y29sdW1uKScgfSkpO1xuXHRcdFx0XHRcdFx0XHR9XG5cblx0XHRcdFx0XHRcdGNvbnN0IHsgZmlsZVBhdGgsIGxpbmUsIGNvbHVtbiB9ID0gcGFyc2VkSWQ7XG5cblx0XHRcdFx0XHRcdC8vIFZhbGlkYXRlIGZpbGUgcGF0aFxuXHRcdFx0XHRcdFx0Y29uc3QgdmFsaWRhdGlvbiA9IHZhbGlkYXRlRmlsZVBhdGgoZmlsZVBhdGgpO1xuXHRcdFx0XHRcdFx0aWYgKCF2YWxpZGF0aW9uLmlzVmFsaWQpIHtcblx0XHRcdFx0XHRcdFx0cmVzLndyaXRlSGVhZCg0MDAsIHsgJ0NvbnRlbnQtVHlwZSc6ICdhcHBsaWNhdGlvbi9qc29uJyB9KTtcblx0XHRcdFx0XHRcdFx0cmV0dXJuIHJlcy5lbmQoSlNPTi5zdHJpbmdpZnkoeyBlcnJvcjogdmFsaWRhdGlvbi5lcnJvciB9KSk7XG5cdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0XHRhYnNvbHV0ZUZpbGVQYXRoID0gdmFsaWRhdGlvbi5hYnNvbHV0ZVBhdGg7XG5cblx0XHRcdFx0XHRcdC8vIFBhcnNlIEFTVFxuXHRcdFx0XHRcdFx0Y29uc3Qgb3JpZ2luYWxDb250ZW50ID0gZnMucmVhZEZpbGVTeW5jKGFic29sdXRlRmlsZVBhdGgsICd1dGYtOCcpO1xuXHRcdFx0XHRcdFx0Y29uc3QgYmFiZWxBc3QgPSBwYXJzZUZpbGVUb0FTVChhYnNvbHV0ZUZpbGVQYXRoKTtcblxuXHRcdFx0XHRcdFx0Ly8gRmluZCB0YXJnZXQgbm9kZSAobm90ZTogYXBwbHktZWRpdCB1c2VzIGNvbHVtbisxKVxuXHRcdFx0XHRcdFx0Y29uc3QgdGFyZ2V0Tm9kZVBhdGggPSBmaW5kSlNYRWxlbWVudEF0UG9zaXRpb24oYmFiZWxBc3QsIGxpbmUsIGNvbHVtbiArIDEpO1xuXG5cdFx0XHRcdFx0XHRpZiAoIXRhcmdldE5vZGVQYXRoKSB7XG5cdFx0XHRcdFx0XHRcdHJlcy53cml0ZUhlYWQoNDA0LCB7ICdDb250ZW50LVR5cGUnOiAnYXBwbGljYXRpb24vanNvbicgfSk7XG5cdFx0XHRcdFx0XHRcdHJldHVybiByZXMuZW5kKEpTT04uc3RyaW5naWZ5KHsgZXJyb3I6ICdUYXJnZXQgbm9kZSBub3QgZm91bmQgYnkgbGluZS9jb2x1bW4nLCBlZGl0SWQgfSkpO1xuXHRcdFx0XHRcdFx0fVxuXG5cdFx0XHRcdFx0XHRjb25zdCB0YXJnZXRPcGVuaW5nRWxlbWVudCA9IHRhcmdldE5vZGVQYXRoLm5vZGU7XG5cdFx0XHRcdFx0XHRjb25zdCBwYXJlbnRFbGVtZW50Tm9kZSA9IHRhcmdldE5vZGVQYXRoLnBhcmVudFBhdGg/Lm5vZGU7XG5cblx0XHRcdFx0XHRcdGNvbnN0IGlzSW1hZ2VFbGVtZW50ID0gdGFyZ2V0T3BlbmluZ0VsZW1lbnQubmFtZSAmJiB0YXJnZXRPcGVuaW5nRWxlbWVudC5uYW1lLm5hbWUgPT09ICdpbWcnO1xuXG5cdFx0XHRcdFx0XHRsZXQgYmVmb3JlQ29kZSA9ICcnO1xuXHRcdFx0XHRcdFx0bGV0IGFmdGVyQ29kZSA9ICcnO1xuXHRcdFx0XHRcdFx0bGV0IG1vZGlmaWVkID0gZmFsc2U7XG5cblx0XHRcdFx0XHRcdGlmIChpc0ltYWdlRWxlbWVudCkge1xuXHRcdFx0XHRcdFx0XHQvLyBIYW5kbGUgaW1hZ2Ugc3JjIGF0dHJpYnV0ZSB1cGRhdGVcblx0XHRcdFx0XHRcdFx0YmVmb3JlQ29kZSA9IGdlbmVyYXRlQ29kZSh0YXJnZXRPcGVuaW5nRWxlbWVudCk7XG5cblx0XHRcdFx0XHRcdFx0Y29uc3Qgc3JjQXR0ciA9IHRhcmdldE9wZW5pbmdFbGVtZW50LmF0dHJpYnV0ZXMuZmluZChhdHRyID0+XG5cdFx0XHRcdFx0XHRcdFx0dC5pc0pTWEF0dHJpYnV0ZShhdHRyKSAmJiBhdHRyLm5hbWUgJiYgYXR0ci5uYW1lLm5hbWUgPT09ICdzcmMnXG5cdFx0XHRcdFx0XHRcdCk7XG5cblx0XHRcdFx0XHRcdFx0aWYgKHNyY0F0dHIgJiYgdC5pc1N0cmluZ0xpdGVyYWwoc3JjQXR0ci52YWx1ZSkpIHtcblx0XHRcdFx0XHRcdFx0XHRzcmNBdHRyLnZhbHVlID0gdC5zdHJpbmdMaXRlcmFsKG5ld0Z1bGxUZXh0KTtcblx0XHRcdFx0XHRcdFx0XHRtb2RpZmllZCA9IHRydWU7XG5cdFx0XHRcdFx0XHRcdFx0YWZ0ZXJDb2RlID0gZ2VuZXJhdGVDb2RlKHRhcmdldE9wZW5pbmdFbGVtZW50KTtcblx0XHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHRcdFx0aWYgKHBhcmVudEVsZW1lbnROb2RlICYmIHQuaXNKU1hFbGVtZW50KHBhcmVudEVsZW1lbnROb2RlKSkge1xuXHRcdFx0XHRcdFx0XHRcdGJlZm9yZUNvZGUgPSBnZW5lcmF0ZUNvZGUocGFyZW50RWxlbWVudE5vZGUpO1xuXG5cdFx0XHRcdFx0XHRcdFx0bGV0IHRleHRSZXBsYWNlZCA9IGZhbHNlO1xuXHRcdFx0XHRcdFx0XHRcdHBhcmVudEVsZW1lbnROb2RlLmNoaWxkcmVuID0gcGFyZW50RWxlbWVudE5vZGUuY2hpbGRyZW4ucmVkdWNlKChhY2MsIGNoaWxkKSA9PiB7XG5cdFx0XHRcdFx0XHRcdFx0XHRpZiAodC5pc0pTWFRleHQoY2hpbGQpKSB7XG5cdFx0XHRcdFx0XHRcdFx0XHRcdGlmICghdGV4dFJlcGxhY2VkICYmIGNoaWxkLnZhbHVlLnRyaW0oKS5sZW5ndGggPiAwICYmIG5ld0Z1bGxUZXh0ICYmIG5ld0Z1bGxUZXh0LnRyaW0oKSAhPT0gJycpIHtcblx0XHRcdFx0XHRcdFx0XHRcdFx0XHRjb25zdCBsZWFkaW5nID0gY2hpbGQudmFsdWUubWF0Y2goL14oXFxzKikvKVswXTtcblx0XHRcdFx0XHRcdFx0XHRcdFx0XHRjb25zdCB0cmFpbGluZyA9IGNoaWxkLnZhbHVlLm1hdGNoKC8oXFxzKikkLylbMF07XG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0YWNjLnB1c2godC5qc3hUZXh0KGxlYWRpbmcgKyBuZXdGdWxsVGV4dC50cmltKCkgKyB0cmFpbGluZykpO1xuXHRcdFx0XHRcdFx0XHRcdFx0XHRcdHRleHRSZXBsYWNlZCA9IHRydWU7XG5cdFx0XHRcdFx0XHRcdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0YWNjLnB1c2goY2hpbGQpO1xuXHRcdFx0XHRcdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0XHRcdFx0XHRcdHJldHVybiBhY2M7XG5cdFx0XHRcdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0XHRcdFx0XHRhY2MucHVzaChjaGlsZCk7XG5cdFx0XHRcdFx0XHRcdFx0XHRyZXR1cm4gYWNjO1xuXHRcdFx0XHRcdFx0XHRcdH0sIFtdKTtcblx0XHRcdFx0XHRcdFx0XHRpZiAoIXRleHRSZXBsYWNlZCAmJiBuZXdGdWxsVGV4dCAmJiBuZXdGdWxsVGV4dC50cmltKCkgIT09ICcnKSB7XG5cdFx0XHRcdFx0XHRcdFx0XHRwYXJlbnRFbGVtZW50Tm9kZS5jaGlsZHJlbi5wdXNoKHQuanN4VGV4dChuZXdGdWxsVGV4dCkpO1xuXHRcdFx0XHRcdFx0XHRcdH1cblxuXHRcdFx0XHRcdFx0XHRcdG1vZGlmaWVkID0gdHJ1ZTtcblx0XHRcdFx0XHRcdFx0XHRhZnRlckNvZGUgPSBnZW5lcmF0ZUNvZGUocGFyZW50RWxlbWVudE5vZGUpO1xuXHRcdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0XHR9XG5cblx0XHRcdFx0XHRcdGlmICghbW9kaWZpZWQpIHtcblx0XHRcdFx0XHRcdFx0cmVzLndyaXRlSGVhZCg0MDksIHsgJ0NvbnRlbnQtVHlwZSc6ICdhcHBsaWNhdGlvbi9qc29uJyB9KTtcblx0XHRcdFx0XHRcdFx0cmV0dXJuIHJlcy5lbmQoSlNPTi5zdHJpbmdpZnkoeyBlcnJvcjogJ0NvdWxkIG5vdCBhcHBseSBjaGFuZ2VzIHRvIEFTVC4nIH0pKTtcblx0XHRcdFx0XHRcdH1cblxuXHRcdFx0XHRcdFx0Y29uc3Qgd2ViUmVsYXRpdmVGaWxlUGF0aCA9IHBhdGgucmVsYXRpdmUoVklURV9QUk9KRUNUX1JPT1QsIGFic29sdXRlRmlsZVBhdGgpLnNwbGl0KHBhdGguc2VwKS5qb2luKCcvJyk7XG5cdFx0XHRcdFx0XHRjb25zdCBvdXRwdXQgPSBnZW5lcmF0ZVNvdXJjZVdpdGhNYXAoYmFiZWxBc3QsIHdlYlJlbGF0aXZlRmlsZVBhdGgsIG9yaWdpbmFsQ29udGVudCk7XG5cdFx0XHRcdFx0XHRjb25zdCBuZXdDb250ZW50ID0gb3V0cHV0LmNvZGU7XG5cblx0XHRcdFx0XHRcdHJlcy53cml0ZUhlYWQoMjAwLCB7ICdDb250ZW50LVR5cGUnOiAnYXBwbGljYXRpb24vanNvbicgfSk7XG5cdFx0XHRcdFx0XHRyZXMuZW5kKEpTT04uc3RyaW5naWZ5KHtcblx0XHRcdFx0XHRcdFx0c3VjY2VzczogdHJ1ZSxcblx0XHRcdFx0XHRcdFx0bmV3RmlsZUNvbnRlbnQ6IG5ld0NvbnRlbnQsXG5cdFx0XHRcdFx0XHRcdGJlZm9yZUNvZGUsXG5cdFx0XHRcdFx0XHRcdGFmdGVyQ29kZSxcblx0XHRcdFx0XHRcdH0pKTtcblxuXHRcdFx0XHRcdH0gY2F0Y2ggKGVycm9yKSB7XG5cdFx0XHRcdFx0XHRyZXMud3JpdGVIZWFkKDUwMCwgeyAnQ29udGVudC1UeXBlJzogJ2FwcGxpY2F0aW9uL2pzb24nIH0pO1xuXHRcdFx0XHRcdFx0cmVzLmVuZChKU09OLnN0cmluZ2lmeSh7IGVycm9yOiAnSW50ZXJuYWwgc2VydmVyIGVycm9yIGR1cmluZyBlZGl0IGFwcGxpY2F0aW9uLicgfSkpO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0fSk7XG5cdFx0XHR9KTtcblx0XHR9XG5cdH07XG59IiwgImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCJDOlxcXFxVc2Vyc1xcXFxKYXptaW4gUmV5ZXMgR3Jpc1xcXFxQcm95ZWN0b1xcXFxwcm95ZWN0b3NcXFxcVHJhZGVhbXgtcGxhdGFmb3JtYVxcXFxwbHVnaW5zXFxcXHV0aWxzXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ZpbGVuYW1lID0gXCJDOlxcXFxVc2Vyc1xcXFxKYXptaW4gUmV5ZXMgR3Jpc1xcXFxQcm95ZWN0b1xcXFxwcm95ZWN0b3NcXFxcVHJhZGVhbXgtcGxhdGFmb3JtYVxcXFxwbHVnaW5zXFxcXHV0aWxzXFxcXGFzdC11dGlscy5qc1wiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9pbXBvcnRfbWV0YV91cmwgPSBcImZpbGU6Ly8vQzovVXNlcnMvSmF6bWluJTIwUmV5ZXMlMjBHcmlzL1Byb3llY3RvL3Byb3llY3Rvcy9UcmFkZWFteC1wbGF0YWZvcm1hL3BsdWdpbnMvdXRpbHMvYXN0LXV0aWxzLmpzXCI7aW1wb3J0IGZzIGZyb20gJ25vZGU6ZnMnO1xuaW1wb3J0IHBhdGggZnJvbSAnbm9kZTpwYXRoJztcbmltcG9ydCB7IGZpbGVVUkxUb1BhdGggfSBmcm9tICdub2RlOnVybCc7XG5pbXBvcnQgZ2VuZXJhdGUgZnJvbSAnQGJhYmVsL2dlbmVyYXRvcic7XG5pbXBvcnQgeyBwYXJzZSB9IGZyb20gJ0BiYWJlbC9wYXJzZXInO1xuaW1wb3J0IHRyYXZlcnNlQmFiZWwgZnJvbSAnQGJhYmVsL3RyYXZlcnNlJztcbmltcG9ydCB7XG5cdGlzSlNYSWRlbnRpZmllcixcblx0aXNKU1hNZW1iZXJFeHByZXNzaW9uLFxufSBmcm9tICdAYmFiZWwvdHlwZXMnO1xuXG5jb25zdCBfX2ZpbGVuYW1lID0gZmlsZVVSTFRvUGF0aChpbXBvcnQubWV0YS51cmwpO1xuY29uc3QgX19kaXJuYW1lID0gcGF0aC5kaXJuYW1lKF9fZmlsZW5hbWUpO1xuY29uc3QgVklURV9QUk9KRUNUX1JPT1QgPSBwYXRoLnJlc29sdmUoX19kaXJuYW1lLCAnLi4vLi4nKTtcblxuLy8gQmxhY2tsaXN0IG9mIGNvbXBvbmVudHMgdGhhdCBzaG91bGQgbm90IGJlIGV4dHJhY3RlZCAodXRpbGl0eS9ub24tdmlzdWFsIGNvbXBvbmVudHMpXG5jb25zdCBDT01QT05FTlRfQkxBQ0tMSVNUID0gbmV3IFNldChbXG5cdCdIZWxtZXQnLFxuXHQnSGVsbWV0UHJvdmlkZXInLFxuXHQnSGVhZCcsXG5cdCdoZWFkJyxcblx0J01ldGEnLFxuXHQnbWV0YScsXG5cdCdTY3JpcHQnLFxuXHQnc2NyaXB0Jyxcblx0J05vU2NyaXB0Jyxcblx0J25vc2NyaXB0Jyxcblx0J1N0eWxlJyxcblx0J3N0eWxlJyxcblx0J3RpdGxlJyxcblx0J1RpdGxlJyxcblx0J2xpbmsnLFxuXHQnTGluaycsXG5dKTtcblxuLyoqXG4gKiBWYWxpZGF0ZXMgdGhhdCBhIGZpbGUgcGF0aCBpcyBzYWZlIHRvIGFjY2Vzc1xuICogQHBhcmFtIHtzdHJpbmd9IGZpbGVQYXRoIC0gUmVsYXRpdmUgZmlsZSBwYXRoXG4gKiBAcmV0dXJucyB7eyBpc1ZhbGlkOiBib29sZWFuLCBhYnNvbHV0ZVBhdGg/OiBzdHJpbmcsIGVycm9yPzogc3RyaW5nIH19IC0gT2JqZWN0IGNvbnRhaW5pbmcgdmFsaWRhdGlvbiByZXN1bHRcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHZhbGlkYXRlRmlsZVBhdGgoZmlsZVBhdGgpIHtcblx0aWYgKCFmaWxlUGF0aCkge1xuXHRcdHJldHVybiB7IGlzVmFsaWQ6IGZhbHNlLCBlcnJvcjogJ01pc3NpbmcgZmlsZVBhdGgnIH07XG5cdH1cblxuXHRjb25zdCBhYnNvbHV0ZUZpbGVQYXRoID0gcGF0aC5yZXNvbHZlKFZJVEVfUFJPSkVDVF9ST09ULCBmaWxlUGF0aCk7XG5cblx0aWYgKGZpbGVQYXRoLmluY2x1ZGVzKCcuLicpXG5cdFx0fHwgIWFic29sdXRlRmlsZVBhdGguc3RhcnRzV2l0aChWSVRFX1BST0pFQ1RfUk9PVClcblx0XHR8fCBhYnNvbHV0ZUZpbGVQYXRoLmluY2x1ZGVzKCdub2RlX21vZHVsZXMnKSkge1xuXHRcdHJldHVybiB7IGlzVmFsaWQ6IGZhbHNlLCBlcnJvcjogJ0ludmFsaWQgcGF0aCcgfTtcblx0fVxuXG5cdGlmICghZnMuZXhpc3RzU3luYyhhYnNvbHV0ZUZpbGVQYXRoKSkge1xuXHRcdHJldHVybiB7IGlzVmFsaWQ6IGZhbHNlLCBlcnJvcjogJ0ZpbGUgbm90IGZvdW5kJyB9O1xuXHR9XG5cblx0cmV0dXJuIHsgaXNWYWxpZDogdHJ1ZSwgYWJzb2x1dGVQYXRoOiBhYnNvbHV0ZUZpbGVQYXRoIH07XG59XG5cbi8qKlxuICogUGFyc2VzIGEgZmlsZSBpbnRvIGEgQmFiZWwgQVNUXG4gKiBAcGFyYW0ge3N0cmluZ30gYWJzb2x1dGVGaWxlUGF0aCAtIEFic29sdXRlIHBhdGggdG8gZmlsZVxuICogQHJldHVybnMge29iamVjdH0gQmFiZWwgQVNUXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBwYXJzZUZpbGVUb0FTVChhYnNvbHV0ZUZpbGVQYXRoKSB7XG5cdGNvbnN0IGNvbnRlbnQgPSBmcy5yZWFkRmlsZVN5bmMoYWJzb2x1dGVGaWxlUGF0aCwgJ3V0Zi04Jyk7XG5cblx0cmV0dXJuIHBhcnNlKGNvbnRlbnQsIHtcblx0XHRzb3VyY2VUeXBlOiAnbW9kdWxlJyxcblx0XHRwbHVnaW5zOiBbJ2pzeCcsICd0eXBlc2NyaXB0J10sXG5cdFx0ZXJyb3JSZWNvdmVyeTogdHJ1ZSxcblx0fSk7XG59XG5cbi8qKlxuICogRmluZHMgYSBKU1ggb3BlbmluZyBlbGVtZW50IGF0IGEgc3BlY2lmaWMgbGluZSBhbmQgY29sdW1uXG4gKiBAcGFyYW0ge29iamVjdH0gYXN0IC0gQmFiZWwgQVNUXG4gKiBAcGFyYW0ge251bWJlcn0gbGluZSAtIExpbmUgbnVtYmVyICgxLWluZGV4ZWQpXG4gKiBAcGFyYW0ge251bWJlcn0gY29sdW1uIC0gQ29sdW1uIG51bWJlciAoMC1pbmRleGVkIGZvciBnZXQtY29kZS1ibG9jaywgMS1pbmRleGVkIGZvciBhcHBseS1lZGl0KVxuICogQHJldHVybnMge29iamVjdCB8IG51bGx9IEJhYmVsIHBhdGggdG8gdGhlIEpTWCBvcGVuaW5nIGVsZW1lbnRcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGZpbmRKU1hFbGVtZW50QXRQb3NpdGlvbihhc3QsIGxpbmUsIGNvbHVtbikge1xuXHRsZXQgdGFyZ2V0Tm9kZVBhdGggPSBudWxsO1xuXHRsZXQgY2xvc2VzdE5vZGVQYXRoID0gbnVsbDtcblx0bGV0IGNsb3Nlc3REaXN0YW5jZSA9IEluZmluaXR5O1xuXHRjb25zdCBhbGxOb2Rlc09uTGluZSA9IFtdO1xuXG5cdGNvbnN0IHZpc2l0b3IgPSB7XG5cdFx0SlNYT3BlbmluZ0VsZW1lbnQocGF0aCkge1xuXHRcdFx0Y29uc3Qgbm9kZSA9IHBhdGgubm9kZTtcblx0XHRcdGlmIChub2RlLmxvYykge1xuXHRcdFx0XHQvLyBFeGFjdCBtYXRjaCAod2l0aCB0b2xlcmFuY2UgZm9yIG9mZi1ieS1vbmUgY29sdW1uIGRpZmZlcmVuY2VzKVxuXHRcdFx0XHRpZiAobm9kZS5sb2Muc3RhcnQubGluZSA9PT0gbGluZVxuXHRcdFx0XHRcdCYmIE1hdGguYWJzKG5vZGUubG9jLnN0YXJ0LmNvbHVtbiAtIGNvbHVtbikgPD0gMSkge1xuXHRcdFx0XHRcdHRhcmdldE5vZGVQYXRoID0gcGF0aDtcblx0XHRcdFx0XHRwYXRoLnN0b3AoKTtcblx0XHRcdFx0XHRyZXR1cm47XG5cdFx0XHRcdH1cblxuXHRcdFx0XHQvLyBUcmFjayBhbGwgbm9kZXMgb24gdGhlIHNhbWUgbGluZVxuXHRcdFx0XHRpZiAobm9kZS5sb2Muc3RhcnQubGluZSA9PT0gbGluZSkge1xuXHRcdFx0XHRcdGFsbE5vZGVzT25MaW5lLnB1c2goe1xuXHRcdFx0XHRcdFx0cGF0aCxcblx0XHRcdFx0XHRcdGNvbHVtbjogbm9kZS5sb2Muc3RhcnQuY29sdW1uLFxuXHRcdFx0XHRcdFx0ZGlzdGFuY2U6IE1hdGguYWJzKG5vZGUubG9jLnN0YXJ0LmNvbHVtbiAtIGNvbHVtbiksXG5cdFx0XHRcdFx0fSk7XG5cdFx0XHRcdH1cblxuXHRcdFx0XHQvLyBUcmFjayBjbG9zZXN0IG1hdGNoIG9uIHRoZSBzYW1lIGxpbmUgZm9yIGZhbGxiYWNrXG5cdFx0XHRcdGlmIChub2RlLmxvYy5zdGFydC5saW5lID09PSBsaW5lKSB7XG5cdFx0XHRcdFx0Y29uc3QgZGlzdGFuY2UgPSBNYXRoLmFicyhub2RlLmxvYy5zdGFydC5jb2x1bW4gLSBjb2x1bW4pO1xuXHRcdFx0XHRcdGlmIChkaXN0YW5jZSA8IGNsb3Nlc3REaXN0YW5jZSkge1xuXHRcdFx0XHRcdFx0Y2xvc2VzdERpc3RhbmNlID0gZGlzdGFuY2U7XG5cdFx0XHRcdFx0XHRjbG9zZXN0Tm9kZVBhdGggPSBwYXRoO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdH0sXG5cdFx0Ly8gQWxzbyBjaGVjayBKU1hFbGVtZW50IG5vZGVzIHRoYXQgY29udGFpbiB0aGUgcG9zaXRpb25cblx0XHRKU1hFbGVtZW50KHBhdGgpIHtcblx0XHRcdGNvbnN0IG5vZGUgPSBwYXRoLm5vZGU7XG5cdFx0XHRpZiAoIW5vZGUubG9jKSB7XG5cdFx0XHRcdHJldHVybjtcblx0XHRcdH1cblxuXHRcdFx0Ly8gQ2hlY2sgaWYgdGhpcyBlbGVtZW50IHNwYW5zIHRoZSB0YXJnZXQgbGluZSAoZm9yIG11bHRpLWxpbmUgZWxlbWVudHMpXG5cdFx0XHRpZiAobm9kZS5sb2Muc3RhcnQubGluZSA+IGxpbmUgfHwgbm9kZS5sb2MuZW5kLmxpbmUgPCBsaW5lKSB7XG5cdFx0XHRcdHJldHVybjtcblx0XHRcdH1cblxuXHRcdFx0Ly8gSWYgd2UncmUgaW5zaWRlIHRoaXMgZWxlbWVudCdzIHJhbmdlLCBjb25zaWRlciBpdHMgb3BlbmluZyBlbGVtZW50XG5cdFx0XHRpZiAoIXBhdGgubm9kZS5vcGVuaW5nRWxlbWVudD8ubG9jKSB7XG5cdFx0XHRcdHJldHVybjtcblx0XHRcdH1cblxuXHRcdFx0Y29uc3Qgb3BlbmluZ0xpbmUgPSBwYXRoLm5vZGUub3BlbmluZ0VsZW1lbnQubG9jLnN0YXJ0LmxpbmU7XG5cdFx0XHRjb25zdCBvcGVuaW5nQ29sID0gcGF0aC5ub2RlLm9wZW5pbmdFbGVtZW50LmxvYy5zdGFydC5jb2x1bW47XG5cblx0XHRcdC8vIFByZWZlciBlbGVtZW50cyB0aGF0IHN0YXJ0IG9uIHRoZSBleGFjdCBsaW5lXG5cdFx0XHRpZiAob3BlbmluZ0xpbmUgPT09IGxpbmUpIHtcblx0XHRcdFx0Y29uc3QgZGlzdGFuY2UgPSBNYXRoLmFicyhvcGVuaW5nQ29sIC0gY29sdW1uKTtcblx0XHRcdFx0aWYgKGRpc3RhbmNlIDwgY2xvc2VzdERpc3RhbmNlKSB7XG5cdFx0XHRcdFx0Y2xvc2VzdERpc3RhbmNlID0gZGlzdGFuY2U7XG5cdFx0XHRcdFx0Y2xvc2VzdE5vZGVQYXRoID0gcGF0aC5nZXQoJ29wZW5pbmdFbGVtZW50Jyk7XG5cdFx0XHRcdH1cblx0XHRcdFx0cmV0dXJuO1xuXHRcdFx0fVxuXG5cdFx0XHQvLyBIYW5kbGUgZWxlbWVudHMgdGhhdCBzdGFydCBiZWZvcmUgdGhlIHRhcmdldCBsaW5lXG5cdFx0XHRpZiAob3BlbmluZ0xpbmUgPCBsaW5lKSB7XG5cdFx0XHRcdGNvbnN0IGRpc3RhbmNlID0gKGxpbmUgLSBvcGVuaW5nTGluZSkgKiAxMDA7IC8vIFBlbmFsaXplIGJ5IGxpbmUgZGlzdGFuY2Vcblx0XHRcdFx0aWYgKGRpc3RhbmNlIDwgY2xvc2VzdERpc3RhbmNlKSB7XG5cdFx0XHRcdFx0Y2xvc2VzdERpc3RhbmNlID0gZGlzdGFuY2U7XG5cdFx0XHRcdFx0Y2xvc2VzdE5vZGVQYXRoID0gcGF0aC5nZXQoJ29wZW5pbmdFbGVtZW50Jyk7XG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHR9LFxuXHR9O1xuXG5cdHRyYXZlcnNlQmFiZWwuZGVmYXVsdChhc3QsIHZpc2l0b3IpO1xuXG5cdC8vIFJldHVybiBleGFjdCBtYXRjaCBpZiBmb3VuZCwgb3RoZXJ3aXNlIHJldHVybiBjbG9zZXN0IG1hdGNoIGlmIHdpdGhpbiByZWFzb25hYmxlIGRpc3RhbmNlXG5cdC8vIFVzZSBsYXJnZXIgdGhyZXNob2xkICg1MCBjaGFycykgZm9yIHNhbWUtbGluZSBlbGVtZW50cywgNSBsaW5lcyBmb3IgbXVsdGktbGluZSBlbGVtZW50c1xuXHRjb25zdCB0aHJlc2hvbGQgPSBjbG9zZXN0RGlzdGFuY2UgPCAxMDAgPyA1MCA6IDUwMDtcblx0cmV0dXJuIHRhcmdldE5vZGVQYXRoIHx8IChjbG9zZXN0RGlzdGFuY2UgPD0gdGhyZXNob2xkID8gY2xvc2VzdE5vZGVQYXRoIDogbnVsbCk7XG59XG5cbi8qKlxuICogQ2hlY2tzIGlmIGEgSlNYIGVsZW1lbnQgbmFtZSBpcyBibGFja2xpc3RlZFxuICogQHBhcmFtIHtvYmplY3R9IGpzeE9wZW5pbmdFbGVtZW50IC0gQmFiZWwgSlNYIG9wZW5pbmcgZWxlbWVudCBub2RlXG4gKiBAcmV0dXJucyB7Ym9vbGVhbn0gVHJ1ZSBpZiBibGFja2xpc3RlZFxuICovXG5mdW5jdGlvbiBpc0JsYWNrbGlzdGVkQ29tcG9uZW50KGpzeE9wZW5pbmdFbGVtZW50KSB7XG5cdGlmICghanN4T3BlbmluZ0VsZW1lbnQgfHwgIWpzeE9wZW5pbmdFbGVtZW50Lm5hbWUpIHtcblx0XHRyZXR1cm4gZmFsc2U7XG5cdH1cblxuXHQvLyBIYW5kbGUgSlNYSWRlbnRpZmllciAoZS5nLiwgPEhlbG1ldD4pXG5cdGlmIChpc0pTWElkZW50aWZpZXIoanN4T3BlbmluZ0VsZW1lbnQubmFtZSkpIHtcblx0XHRyZXR1cm4gQ09NUE9ORU5UX0JMQUNLTElTVC5oYXMoanN4T3BlbmluZ0VsZW1lbnQubmFtZS5uYW1lKTtcblx0fVxuXG5cdC8vIEhhbmRsZSBKU1hNZW1iZXJFeHByZXNzaW9uIChlLmcuLCA8UmVhY3QuRnJhZ21lbnQ+KVxuXHRpZiAoaXNKU1hNZW1iZXJFeHByZXNzaW9uKGpzeE9wZW5pbmdFbGVtZW50Lm5hbWUpKSB7XG5cdFx0bGV0IGN1cnJlbnQgPSBqc3hPcGVuaW5nRWxlbWVudC5uYW1lO1xuXHRcdHdoaWxlIChpc0pTWE1lbWJlckV4cHJlc3Npb24oY3VycmVudCkpIHtcblx0XHRcdGN1cnJlbnQgPSBjdXJyZW50LnByb3BlcnR5O1xuXHRcdH1cblx0XHRpZiAoaXNKU1hJZGVudGlmaWVyKGN1cnJlbnQpKSB7XG5cdFx0XHRyZXR1cm4gQ09NUE9ORU5UX0JMQUNLTElTVC5oYXMoY3VycmVudC5uYW1lKTtcblx0XHR9XG5cdH1cblxuXHRyZXR1cm4gZmFsc2U7XG59XG5cbi8qKlxuICogR2VuZXJhdGVzIGNvZGUgZnJvbSBhbiBBU1Qgbm9kZVxuICogQHBhcmFtIHtvYmplY3R9IG5vZGUgLSBCYWJlbCBBU1Qgbm9kZVxuICogQHBhcmFtIHtvYmplY3R9IG9wdGlvbnMgLSBHZW5lcmF0b3Igb3B0aW9uc1xuICogQHJldHVybnMge3N0cmluZ30gR2VuZXJhdGVkIGNvZGVcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGdlbmVyYXRlQ29kZShub2RlLCBvcHRpb25zID0ge30pIHtcblx0Y29uc3QgZ2VuZXJhdGVGdW5jdGlvbiA9IGdlbmVyYXRlLmRlZmF1bHQgfHwgZ2VuZXJhdGU7XG5cdGNvbnN0IG91dHB1dCA9IGdlbmVyYXRlRnVuY3Rpb24obm9kZSwgb3B0aW9ucyk7XG5cdHJldHVybiBvdXRwdXQuY29kZTtcbn1cblxuLyoqXG4gKiBHZW5lcmF0ZXMgYSBmdWxsIHNvdXJjZSBmaWxlIGZyb20gQVNUIHdpdGggc291cmNlIG1hcHNcbiAqIEBwYXJhbSB7b2JqZWN0fSBhc3QgLSBCYWJlbCBBU1RcbiAqIEBwYXJhbSB7c3RyaW5nfSBzb3VyY2VGaWxlTmFtZSAtIFNvdXJjZSBmaWxlIG5hbWUgZm9yIHNvdXJjZSBtYXBcbiAqIEBwYXJhbSB7c3RyaW5nfSBvcmlnaW5hbENvZGUgLSBPcmlnaW5hbCBzb3VyY2UgY29kZVxuICogQHJldHVybnMge3tjb2RlOiBzdHJpbmcsIG1hcDogb2JqZWN0fX0gLSBPYmplY3QgY29udGFpbmluZyBnZW5lcmF0ZWQgY29kZSBhbmQgc291cmNlIG1hcFxuICovXG5leHBvcnQgZnVuY3Rpb24gZ2VuZXJhdGVTb3VyY2VXaXRoTWFwKGFzdCwgc291cmNlRmlsZU5hbWUsIG9yaWdpbmFsQ29kZSkge1xuXHRjb25zdCBnZW5lcmF0ZUZ1bmN0aW9uID0gZ2VuZXJhdGUuZGVmYXVsdCB8fCBnZW5lcmF0ZTtcblx0cmV0dXJuIGdlbmVyYXRlRnVuY3Rpb24oYXN0LCB7XG5cdFx0c291cmNlTWFwczogdHJ1ZSxcblx0XHRzb3VyY2VGaWxlTmFtZSxcblx0fSwgb3JpZ2luYWxDb2RlKTtcbn1cblxuLyoqXG4gKiBFeHRyYWN0cyBjb2RlIGJsb2NrcyBmcm9tIGEgSlNYIGVsZW1lbnQgYXQgYSBzcGVjaWZpYyBsb2NhdGlvblxuICogQHBhcmFtIHtzdHJpbmd9IGZpbGVQYXRoIC0gUmVsYXRpdmUgZmlsZSBwYXRoXG4gKiBAcGFyYW0ge251bWJlcn0gbGluZSAtIExpbmUgbnVtYmVyXG4gKiBAcGFyYW0ge251bWJlcn0gY29sdW1uIC0gQ29sdW1uIG51bWJlclxuICogQHBhcmFtIHtvYmplY3R9IFtkb21Db250ZXh0XSAtIE9wdGlvbmFsIERPTSBjb250ZXh0IHRvIHJldHVybiBvbiBmYWlsdXJlXG4gKiBAcmV0dXJucyB7e3N1Y2Nlc3M6IGJvb2xlYW4sIGZpbGVQYXRoPzogc3RyaW5nLCBzcGVjaWZpY0xpbmU/OiBzdHJpbmcsIGVycm9yPzogc3RyaW5nLCBkb21Db250ZXh0Pzogb2JqZWN0fX0gLSBPYmplY3Qgd2l0aCBtZXRhZGF0YSBmb3IgTExNXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBleHRyYWN0Q29kZUJsb2NrcyhmaWxlUGF0aCwgbGluZSwgY29sdW1uLCBkb21Db250ZXh0KSB7XG5cdHRyeSB7XG5cdFx0Ly8gVmFsaWRhdGUgZmlsZSBwYXRoXG5cdFx0Y29uc3QgdmFsaWRhdGlvbiA9IHZhbGlkYXRlRmlsZVBhdGgoZmlsZVBhdGgpO1xuXHRcdGlmICghdmFsaWRhdGlvbi5pc1ZhbGlkKSB7XG5cdFx0XHRyZXR1cm4geyBzdWNjZXNzOiBmYWxzZSwgZXJyb3I6IHZhbGlkYXRpb24uZXJyb3IsIGRvbUNvbnRleHQgfTtcblx0XHR9XG5cblx0XHQvLyBQYXJzZSBBU1Rcblx0XHRjb25zdCBhc3QgPSBwYXJzZUZpbGVUb0FTVCh2YWxpZGF0aW9uLmFic29sdXRlUGF0aCk7XG5cblx0XHQvLyBGaW5kIHRhcmdldCBub2RlXG5cdFx0Y29uc3QgdGFyZ2V0Tm9kZVBhdGggPSBmaW5kSlNYRWxlbWVudEF0UG9zaXRpb24oYXN0LCBsaW5lLCBjb2x1bW4pO1xuXG5cdFx0aWYgKCF0YXJnZXROb2RlUGF0aCkge1xuXHRcdFx0cmV0dXJuIHsgc3VjY2VzczogZmFsc2UsIGVycm9yOiAnVGFyZ2V0IG5vZGUgbm90IGZvdW5kIGF0IHNwZWNpZmllZCBsaW5lL2NvbHVtbicsIGRvbUNvbnRleHQgfTtcblx0XHR9XG5cblx0XHQvLyBDaGVjayBpZiB0aGUgdGFyZ2V0IG5vZGUgaXMgYSBibGFja2xpc3RlZCBjb21wb25lbnRcblx0XHRjb25zdCBpc0JsYWNrbGlzdGVkID0gaXNCbGFja2xpc3RlZENvbXBvbmVudCh0YXJnZXROb2RlUGF0aC5ub2RlKTtcblxuXHRcdGlmIChpc0JsYWNrbGlzdGVkKSB7XG5cdFx0XHRyZXR1cm4ge1xuXHRcdFx0XHRzdWNjZXNzOiB0cnVlLFxuXHRcdFx0XHRmaWxlUGF0aCxcblx0XHRcdFx0c3BlY2lmaWNMaW5lOiAnJyxcblx0XHRcdH07XG5cdFx0fVxuXG5cdFx0Ly8gR2V0IHNwZWNpZmljIGxpbmUgY29kZVxuXHRcdGNvbnN0IHNwZWNpZmljTGluZSA9IGdlbmVyYXRlQ29kZSh0YXJnZXROb2RlUGF0aC5wYXJlbnRQYXRoPy5ub2RlIHx8IHRhcmdldE5vZGVQYXRoLm5vZGUpO1xuXG5cdFx0cmV0dXJuIHtcblx0XHRcdHN1Y2Nlc3M6IHRydWUsXG5cdFx0XHRmaWxlUGF0aCxcblx0XHRcdHNwZWNpZmljTGluZSxcblx0XHR9O1xuXHR9IGNhdGNoIChlcnJvcikge1xuXHRcdGNvbnNvbGUuZXJyb3IoJ1thc3QtdXRpbHNdIEVycm9yIGV4dHJhY3RpbmcgY29kZSBibG9ja3M6JywgZXJyb3IpO1xuXHRcdHJldHVybiB7IHN1Y2Nlc3M6IGZhbHNlLCBlcnJvcjogJ0ZhaWxlZCB0byBleHRyYWN0IGNvZGUgYmxvY2tzJywgZG9tQ29udGV4dCB9O1xuXHR9XG59XG5cbi8qKlxuICogUHJvamVjdCByb290IHBhdGhcbiAqL1xuZXhwb3J0IHsgVklURV9QUk9KRUNUX1JPT1QgfTtcbiIsICJjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZGlybmFtZSA9IFwiQzpcXFxcVXNlcnNcXFxcSmF6bWluIFJleWVzIEdyaXNcXFxcUHJveWVjdG9cXFxccHJveWVjdG9zXFxcXFRyYWRlYW14LXBsYXRhZm9ybWFcXFxccGx1Z2luc1xcXFx2aXN1YWwtZWRpdG9yXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ZpbGVuYW1lID0gXCJDOlxcXFxVc2Vyc1xcXFxKYXptaW4gUmV5ZXMgR3Jpc1xcXFxQcm95ZWN0b1xcXFxwcm95ZWN0b3NcXFxcVHJhZGVhbXgtcGxhdGFmb3JtYVxcXFxwbHVnaW5zXFxcXHZpc3VhbC1lZGl0b3JcXFxcdml0ZS1wbHVnaW4tZWRpdC1tb2RlLmpzXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ltcG9ydF9tZXRhX3VybCA9IFwiZmlsZTovLy9DOi9Vc2Vycy9KYXptaW4lMjBSZXllcyUyMEdyaXMvUHJveWVjdG8vcHJveWVjdG9zL1RyYWRlYW14LXBsYXRhZm9ybWEvcGx1Z2lucy92aXN1YWwtZWRpdG9yL3ZpdGUtcGx1Z2luLWVkaXQtbW9kZS5qc1wiO2ltcG9ydCB7IHJlYWRGaWxlU3luYyB9IGZyb20gJ2ZzJztcbmltcG9ydCB7IHJlc29sdmUgfSBmcm9tICdwYXRoJztcbmltcG9ydCB7IGZpbGVVUkxUb1BhdGggfSBmcm9tICd1cmwnO1xuaW1wb3J0IHsgRURJVF9NT0RFX1NUWUxFUyB9IGZyb20gJy4vdmlzdWFsLWVkaXRvci1jb25maWcnO1xuXG5jb25zdCBfX2ZpbGVuYW1lID0gZmlsZVVSTFRvUGF0aChpbXBvcnQubWV0YS51cmwpO1xuY29uc3QgX19kaXJuYW1lID0gcmVzb2x2ZShfX2ZpbGVuYW1lLCAnLi4nKTtcblxuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24gaW5saW5lRWRpdERldlBsdWdpbigpIHtcblx0cmV0dXJuIHtcblx0XHRuYW1lOiAndml0ZTppbmxpbmUtZWRpdC1kZXYnLFxuXHRcdGFwcGx5OiAnc2VydmUnLFxuXHRcdHRyYW5zZm9ybUluZGV4SHRtbCgpIHtcblx0XHRcdGNvbnN0IHNjcmlwdFBhdGggPSByZXNvbHZlKF9fZGlybmFtZSwgJ2VkaXQtbW9kZS1zY3JpcHQuanMnKTtcblx0XHRcdGNvbnN0IHNjcmlwdENvbnRlbnQgPSByZWFkRmlsZVN5bmMoc2NyaXB0UGF0aCwgJ3V0Zi04Jyk7XG5cblx0XHRcdHJldHVybiBbXG5cdFx0XHRcdHtcblx0XHRcdFx0XHR0YWc6ICdzY3JpcHQnLFxuXHRcdFx0XHRcdGF0dHJzOiB7IHR5cGU6ICdtb2R1bGUnIH0sXG5cdFx0XHRcdFx0Y2hpbGRyZW46IHNjcmlwdENvbnRlbnQsXG5cdFx0XHRcdFx0aW5qZWN0VG86ICdib2R5J1xuXHRcdFx0XHR9LFxuXHRcdFx0XHR7XG5cdFx0XHRcdFx0dGFnOiAnc3R5bGUnLFxuXHRcdFx0XHRcdGNoaWxkcmVuOiBFRElUX01PREVfU1RZTEVTLFxuXHRcdFx0XHRcdGluamVjdFRvOiAnaGVhZCdcblx0XHRcdFx0fVxuXHRcdFx0XTtcblx0XHR9XG5cdH07XG59XG4iLCAiY29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2Rpcm5hbWUgPSBcIkM6XFxcXFVzZXJzXFxcXEphem1pbiBSZXllcyBHcmlzXFxcXFByb3llY3RvXFxcXHByb3llY3Rvc1xcXFxUcmFkZWFteC1wbGF0YWZvcm1hXFxcXHBsdWdpbnNcXFxcdmlzdWFsLWVkaXRvclwiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9maWxlbmFtZSA9IFwiQzpcXFxcVXNlcnNcXFxcSmF6bWluIFJleWVzIEdyaXNcXFxcUHJveWVjdG9cXFxccHJveWVjdG9zXFxcXFRyYWRlYW14LXBsYXRhZm9ybWFcXFxccGx1Z2luc1xcXFx2aXN1YWwtZWRpdG9yXFxcXHZpc3VhbC1lZGl0b3ItY29uZmlnLmpzXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ltcG9ydF9tZXRhX3VybCA9IFwiZmlsZTovLy9DOi9Vc2Vycy9KYXptaW4lMjBSZXllcyUyMEdyaXMvUHJveWVjdG8vcHJveWVjdG9zL1RyYWRlYW14LXBsYXRhZm9ybWEvcGx1Z2lucy92aXN1YWwtZWRpdG9yL3Zpc3VhbC1lZGl0b3ItY29uZmlnLmpzXCI7ZXhwb3J0IGNvbnN0IFBPUFVQX1NUWUxFUyA9IGBcbiNpbmxpbmUtZWRpdG9yLXBvcHVwIHtcblx0d2lkdGg6IDM2MHB4O1xuXHRwb3NpdGlvbjogZml4ZWQ7XG5cdHotaW5kZXg6IDEwMDAwO1xuXHRiYWNrZ3JvdW5kOiAjMTYxNzE4O1xuXHRjb2xvcjogd2hpdGU7XG5cdGJvcmRlcjogMXB4IHNvbGlkICM0YTU1Njg7XG5cdGJvcmRlci1yYWRpdXM6IDE2cHg7XG5cdHBhZGRpbmc6IDhweDtcblx0Ym94LXNoYWRvdzogMCA0cHggMTJweCByZ2JhKDAsMCwwLDAuMik7XG5cdGZsZXgtZGlyZWN0aW9uOiBjb2x1bW47XG5cdGdhcDogMTBweDtcblx0ZGlzcGxheTogbm9uZTtcbn1cblxuQG1lZGlhIChtYXgtd2lkdGg6IDc2OHB4KSB7XG5cdCNpbmxpbmUtZWRpdG9yLXBvcHVwIHtcblx0XHR3aWR0aDogY2FsYygxMDAlIC0gMjBweCk7XG5cdH1cbn1cblxuI2lubGluZS1lZGl0b3ItcG9wdXAuaXMtYWN0aXZlIHtcblx0ZGlzcGxheTogZmxleDtcblx0dG9wOiA1MCU7XG5cdGxlZnQ6IDUwJTtcblx0dHJhbnNmb3JtOiB0cmFuc2xhdGUoLTUwJSwgLTUwJSk7XG59XG5cbiNpbmxpbmUtZWRpdG9yLXBvcHVwLmlzLWRpc2FibGVkLXZpZXcge1xuXHRwYWRkaW5nOiAxMHB4IDE1cHg7XG59XG5cbiNpbmxpbmUtZWRpdG9yLXBvcHVwIHRleHRhcmVhIHtcblx0aGVpZ2h0OiAxMDBweDtcblx0cGFkZGluZzogNHB4IDhweDtcblx0YmFja2dyb3VuZDogdHJhbnNwYXJlbnQ7XG5cdGNvbG9yOiB3aGl0ZTtcblx0Zm9udC1mYW1pbHk6IGluaGVyaXQ7XG5cdGZvbnQtc2l6ZTogMC44NzVyZW07XG5cdGxpbmUtaGVpZ2h0OiAxLjQyO1xuXHRyZXNpemU6IG5vbmU7XG5cdG91dGxpbmU6IG5vbmU7XG59XG5cbiNpbmxpbmUtZWRpdG9yLXBvcHVwIC5idXR0b24tY29udGFpbmVyIHtcblx0ZGlzcGxheTogZmxleDtcblx0anVzdGlmeS1jb250ZW50OiBmbGV4LWVuZDtcblx0Z2FwOiAxMHB4O1xufVxuXG4jaW5saW5lLWVkaXRvci1wb3B1cCAucG9wdXAtYnV0dG9uIHtcblx0Ym9yZGVyOiBub25lO1xuXHRwYWRkaW5nOiA2cHggMTZweDtcblx0Ym9yZGVyLXJhZGl1czogOHB4O1xuXHRjdXJzb3I6IHBvaW50ZXI7XG5cdGZvbnQtc2l6ZTogMC43NXJlbTtcblx0Zm9udC13ZWlnaHQ6IDcwMDtcblx0aGVpZ2h0OiAzNHB4O1xuXHRvdXRsaW5lOiBub25lO1xufVxuXG4jaW5saW5lLWVkaXRvci1wb3B1cCAuc2F2ZS1idXR0b24ge1xuXHRiYWNrZ3JvdW5kOiAjNjczZGU2O1xuXHRjb2xvcjogd2hpdGU7XG59XG5cbiNpbmxpbmUtZWRpdG9yLXBvcHVwIC5jYW5jZWwtYnV0dG9uIHtcblx0YmFja2dyb3VuZDogdHJhbnNwYXJlbnQ7XG5cdGJvcmRlcjogMXB4IHNvbGlkICMzYjNkNGE7XG5cdGNvbG9yOiB3aGl0ZTtcblxuXHQmOmhvdmVyIHtcblx0YmFja2dyb3VuZDojNDc0OTU4O1xuXHR9XG59XG5gO1xuXG5leHBvcnQgZnVuY3Rpb24gZ2V0UG9wdXBIVE1MVGVtcGxhdGUoc2F2ZUxhYmVsLCBjYW5jZWxMYWJlbCkge1xuXHRyZXR1cm4gYFxuXHQ8dGV4dGFyZWE+PC90ZXh0YXJlYT5cblx0PGRpdiBjbGFzcz1cImJ1dHRvbi1jb250YWluZXJcIj5cblx0XHQ8YnV0dG9uIGNsYXNzPVwicG9wdXAtYnV0dG9uIGNhbmNlbC1idXR0b25cIj4ke2NhbmNlbExhYmVsfTwvYnV0dG9uPlxuXHRcdDxidXR0b24gY2xhc3M9XCJwb3B1cC1idXR0b24gc2F2ZS1idXR0b25cIj4ke3NhdmVMYWJlbH08L2J1dHRvbj5cblx0PC9kaXY+XG5cdGA7XG59XG5cbmV4cG9ydCBjb25zdCBFRElUX01PREVfU1RZTEVTID0gYFxuXHQjcm9vdFtkYXRhLWVkaXQtbW9kZS1lbmFibGVkPVwidHJ1ZVwiXSBbZGF0YS1lZGl0LWlkXSB7XG5cdFx0Y3Vyc29yOiBwb2ludGVyOyBcblx0XHRvdXRsaW5lOiAycHggZGFzaGVkICMzNTdERjk7IFxuXHRcdG91dGxpbmUtb2Zmc2V0OiAycHg7XG5cdFx0bWluLWhlaWdodDogMWVtO1xuXHR9XG5cdCNyb290W2RhdGEtZWRpdC1tb2RlLWVuYWJsZWQ9XCJ0cnVlXCJdIGltZ1tkYXRhLWVkaXQtaWRdIHtcblx0XHRvdXRsaW5lLW9mZnNldDogLTJweDtcblx0fVxuXHQjcm9vdFtkYXRhLWVkaXQtbW9kZS1lbmFibGVkPVwidHJ1ZVwiXSB7XG5cdFx0Y3Vyc29yOiBwb2ludGVyO1xuXHR9XG5cdCNyb290W2RhdGEtZWRpdC1tb2RlLWVuYWJsZWQ9XCJ0cnVlXCJdIFtkYXRhLWVkaXQtaWRdOmhvdmVyIHtcblx0XHRiYWNrZ3JvdW5kLWNvbG9yOiAjMzU3REY5MzM7XG5cdFx0b3V0bGluZS1jb2xvcjogIzM1N0RGOTsgXG5cdH1cblxuXHRAa2V5ZnJhbWVzIGZhZGVJblRvb2x0aXAge1xuXHRcdGZyb20ge1xuXHRcdFx0b3BhY2l0eTogMDtcblx0XHRcdHRyYW5zZm9ybTogdHJhbnNsYXRlWSg1cHgpO1xuXHRcdH1cblx0XHR0byB7XG5cdFx0XHRvcGFjaXR5OiAxO1xuXHRcdFx0dHJhbnNmb3JtOiB0cmFuc2xhdGVZKDApO1xuXHRcdH1cblx0fVxuXG5cdCNpbmxpbmUtZWRpdG9yLWRpc2FibGVkLXRvb2x0aXAge1xuXHRcdGRpc3BsYXk6IG5vbmU7IFxuXHRcdG9wYWNpdHk6IDA7IFxuXHRcdHBvc2l0aW9uOiBhYnNvbHV0ZTtcblx0XHRiYWNrZ3JvdW5kLWNvbG9yOiAjMUQxRTIwO1xuXHRcdGNvbG9yOiB3aGl0ZTtcblx0XHRwYWRkaW5nOiA0cHggOHB4O1xuXHRcdGJvcmRlci1yYWRpdXM6IDhweDtcblx0XHR6LWluZGV4OiAxMDAwMTtcblx0XHRmb250LXNpemU6IDE0cHg7XG5cdFx0Ym9yZGVyOiAxcHggc29saWQgIzNCM0Q0QTtcblx0XHRtYXgtd2lkdGg6IDE4NHB4O1xuXHRcdHRleHQtYWxpZ246IGNlbnRlcjtcblx0fVxuXG5cdCNpbmxpbmUtZWRpdG9yLWRpc2FibGVkLXRvb2x0aXAudG9vbHRpcC1hY3RpdmUge1xuXHRcdGRpc3BsYXk6IGJsb2NrO1xuXHRcdGFuaW1hdGlvbjogZmFkZUluVG9vbHRpcCAwLjJzIGVhc2Utb3V0IGZvcndhcmRzO1xuXHR9XG5gO1xuIiwgImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCJDOlxcXFxVc2Vyc1xcXFxKYXptaW4gUmV5ZXMgR3Jpc1xcXFxQcm95ZWN0b1xcXFxwcm95ZWN0b3NcXFxcVHJhZGVhbXgtcGxhdGFmb3JtYVxcXFxwbHVnaW5zXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ZpbGVuYW1lID0gXCJDOlxcXFxVc2Vyc1xcXFxKYXptaW4gUmV5ZXMgR3Jpc1xcXFxQcm95ZWN0b1xcXFxwcm95ZWN0b3NcXFxcVHJhZGVhbXgtcGxhdGFmb3JtYVxcXFxwbHVnaW5zXFxcXHZpdGUtcGx1Z2luLWlmcmFtZS1yb3V0ZS1yZXN0b3JhdGlvbi5qc1wiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9pbXBvcnRfbWV0YV91cmwgPSBcImZpbGU6Ly8vQzovVXNlcnMvSmF6bWluJTIwUmV5ZXMlMjBHcmlzL1Byb3llY3RvL3Byb3llY3Rvcy9UcmFkZWFteC1wbGF0YWZvcm1hL3BsdWdpbnMvdml0ZS1wbHVnaW4taWZyYW1lLXJvdXRlLXJlc3RvcmF0aW9uLmpzXCI7ZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24gaWZyYW1lUm91dGVSZXN0b3JhdGlvblBsdWdpbigpIHtcbiAgcmV0dXJuIHtcbiAgICBuYW1lOiAndml0ZTppZnJhbWUtcm91dGUtcmVzdG9yYXRpb24nLFxuICAgIGFwcGx5OiAnc2VydmUnLFxuICAgIHRyYW5zZm9ybUluZGV4SHRtbCgpIHtcbiAgICAgIGNvbnN0IHNjcmlwdCA9IGBcbiAgICAgIGNvbnN0IEFMTE9XRURfUEFSRU5UX09SSUdJTlMgPSBbXG4gICAgICAgICAgXCJodHRwczovL2hvcml6b25zLmhvc3Rpbmdlci5jb21cIixcbiAgICAgICAgICBcImh0dHBzOi8vaG9yaXpvbnMuaG9zdGluZ2VyLmRldlwiLFxuICAgICAgICAgIFwiaHR0cHM6Ly9ob3Jpem9ucy1mcm9udGVuZC1sb2NhbC5ob3N0aW5nZXIuZGV2XCIsXG4gICAgICBdO1xuXG4gICAgICAgIC8vIENoZWNrIHRvIHNlZSBpZiB0aGUgcGFnZSBpcyBpbiBhbiBpZnJhbWVcbiAgICAgICAgaWYgKHdpbmRvdy5zZWxmICE9PSB3aW5kb3cudG9wKSB7XG4gICAgICAgICAgY29uc3QgU1RPUkFHRV9LRVkgPSAnaG9yaXpvbnMtaWZyYW1lLXNhdmVkLXJvdXRlJztcblxuICAgICAgICAgIGNvbnN0IGdldEN1cnJlbnRSb3V0ZSA9ICgpID0+IGxvY2F0aW9uLnBhdGhuYW1lICsgbG9jYXRpb24uc2VhcmNoICsgbG9jYXRpb24uaGFzaDtcblxuICAgICAgICAgIGNvbnN0IHNhdmUgPSAoKSA9PiB7XG4gICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICBjb25zdCBjdXJyZW50Um91dGUgPSBnZXRDdXJyZW50Um91dGUoKTtcbiAgICAgICAgICAgICAgc2Vzc2lvblN0b3JhZ2Uuc2V0SXRlbShTVE9SQUdFX0tFWSwgY3VycmVudFJvdXRlKTtcbiAgICAgICAgICAgICAgd2luZG93LnBhcmVudC5wb3N0TWVzc2FnZSh7bWVzc2FnZTogJ3JvdXRlLWNoYW5nZWQnLCByb3V0ZTogY3VycmVudFJvdXRlfSwgJyonKTtcbiAgICAgICAgICAgIH0gY2F0Y2gge31cbiAgICAgICAgICB9O1xuXG4gICAgICAgICAgY29uc3QgcmVwbGFjZUhpc3RvcnlTdGF0ZSA9ICh1cmwpID0+IHtcbiAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgIGhpc3RvcnkucmVwbGFjZVN0YXRlKG51bGwsICcnLCB1cmwpO1xuICAgICAgICAgICAgICB3aW5kb3cuZGlzcGF0Y2hFdmVudChuZXcgUG9wU3RhdGVFdmVudCgncG9wc3RhdGUnLCB7IHN0YXRlOiBoaXN0b3J5LnN0YXRlIH0pKTtcbiAgICAgICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgICAgICB9IGNhdGNoIHt9XG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgICAgfTtcblxuICAgICAgICAgIGNvbnN0IHJlc3RvcmUgPSAoKSA9PiB7XG4gICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICBjb25zdCBzYXZlZCA9IHNlc3Npb25TdG9yYWdlLmdldEl0ZW0oU1RPUkFHRV9LRVkpO1xuICAgICAgICAgICAgICBpZiAoIXNhdmVkKSByZXR1cm47XG5cbiAgICAgICAgICAgICAgaWYgKCFzYXZlZC5zdGFydHNXaXRoKCcvJykpIHtcbiAgICAgICAgICAgICAgICBzZXNzaW9uU3RvcmFnZS5yZW1vdmVJdGVtKFNUT1JBR0VfS0VZKTtcbiAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICBjb25zdCBjdXJyZW50ID0gZ2V0Q3VycmVudFJvdXRlKCk7XG4gICAgICAgICAgICAgIGlmIChjdXJyZW50ICE9PSBzYXZlZCkge1xuICAgICAgICAgICAgICAgIGlmICghcmVwbGFjZUhpc3RvcnlTdGF0ZShzYXZlZCkpIHtcbiAgICAgICAgICAgICAgICAgIHJlcGxhY2VIaXN0b3J5U3RhdGUoJy8nKTtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICByZXF1ZXN0QW5pbWF0aW9uRnJhbWUoKCkgPT4gc2V0VGltZW91dCgoKSA9PiB7XG4gICAgICAgICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgICAgICBjb25zdCB0ZXh0ID0gKGRvY3VtZW50LmJvZHk/LmlubmVyVGV4dCB8fCAnJykudHJpbSgpO1xuXG4gICAgICAgICAgICAgICAgICAgIC8vIElmIHRoZSByZXN0b3JlZCByb3V0ZSByZXN1bHRzIGluIHRvbyBsaXR0bGUgY29udGVudCwgYXNzdW1lIGl0IGlzIGludmFsaWQgYW5kIG5hdmlnYXRlIGhvbWVcbiAgICAgICAgICAgICAgICAgICAgaWYgKHRleHQubGVuZ3RoIDwgNTApIHtcbiAgICAgICAgICAgICAgICAgICAgICByZXBsYWNlSGlzdG9yeVN0YXRlKCcvJyk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgIH0gY2F0Y2gge31cbiAgICAgICAgICAgICAgICB9LCAxMDAwKSk7XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0gY2F0Y2gge31cbiAgICAgICAgICB9O1xuXG4gICAgICAgICAgY29uc3Qgb3JpZ2luYWxQdXNoU3RhdGUgPSBoaXN0b3J5LnB1c2hTdGF0ZTtcbiAgICAgICAgICBoaXN0b3J5LnB1c2hTdGF0ZSA9IGZ1bmN0aW9uKC4uLmFyZ3MpIHtcbiAgICAgICAgICAgIG9yaWdpbmFsUHVzaFN0YXRlLmFwcGx5KHRoaXMsIGFyZ3MpO1xuICAgICAgICAgICAgc2F2ZSgpO1xuICAgICAgICAgIH07XG5cbiAgICAgICAgICBjb25zdCBvcmlnaW5hbFJlcGxhY2VTdGF0ZSA9IGhpc3RvcnkucmVwbGFjZVN0YXRlO1xuICAgICAgICAgIGhpc3RvcnkucmVwbGFjZVN0YXRlID0gZnVuY3Rpb24oLi4uYXJncykge1xuICAgICAgICAgICAgb3JpZ2luYWxSZXBsYWNlU3RhdGUuYXBwbHkodGhpcywgYXJncyk7XG4gICAgICAgICAgICBzYXZlKCk7XG4gICAgICAgICAgfTtcblxuICAgICAgICAgIGNvbnN0IGdldFBhcmVudE9yaWdpbiA9ICgpID0+IHtcbiAgICAgICAgICAgICAgaWYgKFxuICAgICAgICAgICAgICAgICAgd2luZG93LmxvY2F0aW9uLmFuY2VzdG9yT3JpZ2lucyAmJlxuICAgICAgICAgICAgICAgICAgd2luZG93LmxvY2F0aW9uLmFuY2VzdG9yT3JpZ2lucy5sZW5ndGggPiAwXG4gICAgICAgICAgICAgICkge1xuICAgICAgICAgICAgICAgICAgcmV0dXJuIHdpbmRvdy5sb2NhdGlvbi5hbmNlc3Rvck9yaWdpbnNbMF07XG4gICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICBpZiAoZG9jdW1lbnQucmVmZXJyZXIpIHtcbiAgICAgICAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIG5ldyBVUkwoZG9jdW1lbnQucmVmZXJyZXIpLm9yaWdpbjtcbiAgICAgICAgICAgICAgICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgICAgICAgICAgICAgICBjb25zb2xlLndhcm4oXCJJbnZhbGlkIHJlZmVycmVyIFVSTDpcIiwgZG9jdW1lbnQucmVmZXJyZXIpO1xuICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgICAgICAgfTtcblxuICAgICAgICAgIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKCdwb3BzdGF0ZScsIHNhdmUpO1xuICAgICAgICAgIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKCdoYXNoY2hhbmdlJywgc2F2ZSk7XG4gICAgICAgICAgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoXCJtZXNzYWdlXCIsIGZ1bmN0aW9uIChldmVudCkge1xuICAgICAgICAgICAgICBjb25zdCBwYXJlbnRPcmlnaW4gPSBnZXRQYXJlbnRPcmlnaW4oKTtcblxuICAgICAgICAgICAgICBpZiAoZXZlbnQuZGF0YT8udHlwZSA9PT0gXCJyZWRpcmVjdC1ob21lXCIgJiYgcGFyZW50T3JpZ2luICYmIEFMTE9XRURfUEFSRU5UX09SSUdJTlMuaW5jbHVkZXMocGFyZW50T3JpZ2luKSkge1xuICAgICAgICAgICAgICAgIGNvbnN0IHNhdmVkID0gc2Vzc2lvblN0b3JhZ2UuZ2V0SXRlbShTVE9SQUdFX0tFWSk7XG5cbiAgICAgICAgICAgICAgICBpZihzYXZlZCAmJiBzYXZlZCAhPT0gJy8nKSB7XG4gICAgICAgICAgICAgICAgICByZXBsYWNlSGlzdG9yeVN0YXRlKCcvJylcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICB9KTtcblxuICAgICAgICAgIHJlc3RvcmUoKTtcbiAgICAgICAgfVxuICAgICAgYDtcblxuICAgICAgcmV0dXJuIFtcbiAgICAgICAge1xuICAgICAgICAgIHRhZzogJ3NjcmlwdCcsXG4gICAgICAgICAgYXR0cnM6IHsgdHlwZTogJ21vZHVsZScgfSxcbiAgICAgICAgICBjaGlsZHJlbjogc2NyaXB0LFxuICAgICAgICAgIGluamVjdFRvOiAnaGVhZCdcbiAgICAgICAgfVxuICAgICAgXTtcbiAgICB9XG4gIH07XG59XG4iLCAiY29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2Rpcm5hbWUgPSBcIkM6XFxcXFVzZXJzXFxcXEphem1pbiBSZXllcyBHcmlzXFxcXFByb3llY3RvXFxcXHByb3llY3Rvc1xcXFxUcmFkZWFteC1wbGF0YWZvcm1hXFxcXHBsdWdpbnNcXFxcc2VsZWN0aW9uLW1vZGVcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZmlsZW5hbWUgPSBcIkM6XFxcXFVzZXJzXFxcXEphem1pbiBSZXllcyBHcmlzXFxcXFByb3llY3RvXFxcXHByb3llY3Rvc1xcXFxUcmFkZWFteC1wbGF0YWZvcm1hXFxcXHBsdWdpbnNcXFxcc2VsZWN0aW9uLW1vZGVcXFxcdml0ZS1wbHVnaW4tc2VsZWN0aW9uLW1vZGUuanNcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfaW1wb3J0X21ldGFfdXJsID0gXCJmaWxlOi8vL0M6L1VzZXJzL0phem1pbiUyMFJleWVzJTIwR3Jpcy9Qcm95ZWN0by9wcm95ZWN0b3MvVHJhZGVhbXgtcGxhdGFmb3JtYS9wbHVnaW5zL3NlbGVjdGlvbi1tb2RlL3ZpdGUtcGx1Z2luLXNlbGVjdGlvbi1tb2RlLmpzXCI7aW1wb3J0IHsgcmVhZEZpbGVTeW5jIH0gZnJvbSAnbm9kZTpmcyc7XG5pbXBvcnQgeyByZXNvbHZlIH0gZnJvbSAnbm9kZTpwYXRoJztcbmltcG9ydCB7IGZpbGVVUkxUb1BhdGggfSBmcm9tICdub2RlOnVybCc7XG5cbmNvbnN0IF9fZmlsZW5hbWUgPSBmaWxlVVJMVG9QYXRoKGltcG9ydC5tZXRhLnVybCk7XG5jb25zdCBfX2Rpcm5hbWUgPSByZXNvbHZlKF9fZmlsZW5hbWUsICcuLicpO1xuXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbiBzZWxlY3Rpb25Nb2RlUGx1Z2luKCkge1xuXHRyZXR1cm4ge1xuXHRcdG5hbWU6ICd2aXRlOnNlbGVjdGlvbi1tb2RlJyxcblx0XHRhcHBseTogJ3NlcnZlJyxcblxuXHRcdHRyYW5zZm9ybUluZGV4SHRtbCgpIHtcblx0XHRcdGNvbnN0IHNjcmlwdFBhdGggPSByZXNvbHZlKF9fZGlybmFtZSwgJ3NlbGVjdGlvbi1tb2RlLXNjcmlwdC5qcycpO1xuXHRcdFx0Y29uc3Qgc2NyaXB0Q29udGVudCA9IHJlYWRGaWxlU3luYyhzY3JpcHRQYXRoLCAndXRmLTgnKTtcblxuXHRcdFx0cmV0dXJuIFtcblx0XHRcdFx0e1xuXHRcdFx0XHRcdHRhZzogJ3NjcmlwdCcsXG5cdFx0XHRcdFx0YXR0cnM6IHsgdHlwZTogJ21vZHVsZScgfSxcblx0XHRcdFx0XHRjaGlsZHJlbjogc2NyaXB0Q29udGVudCxcblx0XHRcdFx0XHRpbmplY3RUbzogJ2JvZHknLFxuXHRcdFx0XHR9LFxuXHRcdFx0XTtcblx0XHR9LFxuXHR9O1xufVxuIl0sCiAgIm1hcHBpbmdzIjogIjtBQUFxWSxPQUFPQSxXQUFVO0FBQ3RaLE9BQU8sV0FBVztBQUNsQixTQUFTLGNBQWMsb0JBQW9CO0FBQzNDLFNBQVMsZUFBZTs7O0FDSDJkLE9BQU9DLFdBQVU7QUFDcGdCLFNBQVMsU0FBQUMsY0FBYTtBQUN0QixPQUFPQyxvQkFBbUI7QUFDMUIsWUFBWSxPQUFP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QUFBQSxJQUNELENBQUM7QUFBQSxFQUNGO0FBQUEsRUFDQSxRQUFRO0FBQUEsSUFDUCxNQUFNO0FBQUEsSUFDTixTQUFTO0FBQUEsTUFDUixnQ0FBZ0M7QUFBQSxJQUNqQztBQUFBLElBQ0EsY0FBYztBQUFBLEVBQ2Y7QUFBQSxFQUNBLFNBQVM7QUFBQSxJQUNSLFlBQVksQ0FBQyxRQUFRLE9BQU8sUUFBUSxPQUFPLE9BQVM7QUFBQSxJQUNwRCxPQUFPO0FBQUEsTUFDTixLQUFLQyxNQUFLLFFBQVEsa0NBQVcsT0FBTztBQUFBLElBQ3JDO0FBQUEsRUFDRDtBQUFBLEVBQ0EsT0FBTztBQUFBLElBQ04sZUFBZTtBQUFBLE1BQ2QsVUFBVTtBQUFBLFFBQ1Q7QUFBQSxRQUNBO0FBQUEsUUFDQTtBQUFBLFFBQ0E7QUFBQSxNQUNEO0FBQUEsSUFDRDtBQUFBLEVBQ0Q7QUFDRCxDQUFDOyIsCiAgIm5hbWVzIjogWyJwYXRoIiwgInBhdGgiLCAicGFyc2UiLCAidHJhdmVyc2VCYWJlbCIsICJmcyIsICJfX2Rpcm5hbWUiLCAicGF0aCIsICJwYXRoIiwgInBhcnNlIiwgInRyYXZlcnNlQmFiZWwiLCAiZnMiLCAiZmlsZVVSTFRvUGF0aCIsICJfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfaW1wb3J0X21ldGFfdXJsIiwgIl9fZmlsZW5hbWUiLCAiZmlsZVVSTFRvUGF0aCIsICJfX2Rpcm5hbWUiLCAicmVhZEZpbGVTeW5jIiwgInJlc29sdmUiLCAiZmlsZVVSTFRvUGF0aCIsICJfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfaW1wb3J0X21ldGFfdXJsIiwgIl9fZmlsZW5hbWUiLCAiZmlsZVVSTFRvUGF0aCIsICJfX2Rpcm5hbWUiLCAicmVzb2x2ZSIsICJyZWFkRmlsZVN5bmMiLCAicGF0aCJdCn0K

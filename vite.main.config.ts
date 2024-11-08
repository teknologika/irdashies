import { defineConfig } from 'vite';
import fs from 'fs';
import path from 'path';

export default defineConfig({
  plugins: [
    irsdkNativeModule(
      ['node_modules/@irsdk-node/native/build/Release/irsdk_node.node'],
      '.vite/build/node_modules/@irsdk-node/native/build/Release/'
    ),
  ],
});

// this handles the native module for irsdk-node so vite can bundle it as its currently cjs only
// this plugin will import it using createRequire and copy the native module to the vite build directory
function irsdkNativeModule(nodeFiles: string[], outDir: string) {
  const nodeFileMap = new Map(
    nodeFiles.map((file) => [path.basename(file), file])
  );

  return {
    name: 'irsdk-native-module-plugin',
    resolveId(source: string) {
      return nodeFileMap.has(path.basename(source)) ? source : null;
    },
    transform(code: string, id: string) {
      const file = nodeFileMap.get(path.basename(id));
      if (file) {
        return `
          import { createRequire } from 'module';
          const customRequire = createRequire(import.meta.url);
          export const iRacingSdkNode = customRequire('./${file}').iRacingSdkNode;
        `;
      }
      return code;
    },
    load(id: string) {
      return nodeFileMap.has(path.basename(id)) ? '' : null;
    },
    generateBundle() {
      nodeFileMap.forEach((fileAbs, file) => {
        const out = `${outDir}/${file}`;
        const nodeFile = fs.readFileSync(fileAbs);
        fs.mkdirSync(path.dirname(out), { recursive: true });
        fs.writeFileSync(out, nodeFile);
      });
    },
  };
}

import { defineConfig } from 'vite';
import { visualizer } from 'rollup-plugin-visualizer';
import ts2 from 'rollup-plugin-typescript2';

export default defineConfig({
    plugins: [
        {
            ...ts2({
                check: true,
                tsconfig: './tsconfig.json',
                tsconfigOverride: {
                    compilerOptions: {
                        sourceMap: false,
                        declaration: true,
                        declarationMap: false,
                    },
                },
            }),
            enforce: 'pre',
        },
    ],
    build: {
        target: 'esnext',
        lib: {
            entry: 'src/index.ts',
            fileName: () => 'index.js',
            formats: ['es'],
        },
        rollupOptions: {
            plugins: [visualizer()]
        },
    },
});

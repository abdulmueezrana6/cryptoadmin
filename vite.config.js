import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import obfuscatorPlugin from 'vite-plugin-javascript-obfuscator'

export default defineConfig({
  build: {
    sourcemap: false,           // KHÔNG tạo source maps
    minify: 'terser',           // dùng terser để cấu hình sâu hơn
    terserOptions: {
      compress: {
        ecma: 2017,
        passes: 3,
        pure_funcs: ['console.info', 'console.debug', 'console.log', 'console.warn'],
      },
      mangle: {
        toplevel: true,
        properties: {
          // Cảnh báo: mangle properties có thể phá vỡ code nếu bạn truy cập thuộc tính bằng chuỗi
          regex: '^_?private', // chỉ đổi tên các thuộc tính bắt đầu bằng "_private..." (ví dụ)
        }
      },
      format: {
        comments: false
      }
    },
    rollupOptions: {
      output: {
        // tách chunk theo cách khó đoán hơn (tùy trường hợp)
        manualChunks(id) {
          if (id.includes('node_modules')) return 'vendor'
          if (id.endsWith('.css')) return 'styles'
          // random hóa một chút tên chunk bằng timestamp (build-time)
          return undefined
        }
      }
    }
  },
  server: {
    host: "localhost",
    port: 3000,
  },
  plugins: [
    react(),
    obfuscatorPlugin({
      options: {
        compact: true,
        controlFlowFlattening: true,
        controlFlowFlatteningThreshold: 0.8,
        deadCodeInjection: true,
        deadCodeInjectionThreshold: 0.6,
        debugProtection: false,
        disableConsoleOutput: true,
        identifierNamesGenerator: 'hexadecimal',
        log: false,
        renameGlobals: false,
        rotateStringArray: true,
        stringArray: true,
        stringArrayEncoding: ['rc4'],
        stringArrayThreshold: 0.9,
        transformObjectKeys: true,
        unicodeEscapeSequence: false
      }
    })
  ]
})


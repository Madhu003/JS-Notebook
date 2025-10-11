/**
 * Babel Service - Handles dynamic loading and compilation using Babel
 */

interface BabelCompileResult {
  code: string;
  success: boolean;
  error?: string;
}

interface BabelService {
  loadBabel: () => Promise<boolean>;
  compileTypeScript: (code: string) => Promise<BabelCompileResult>;
  compileReact: (code: string, typeScript: boolean) => Promise<BabelCompileResult>;
  isBabelLoaded: () => boolean;
}

class BabelServiceImpl implements BabelService {
  private babelLoaded = false;
  private loadingPromise: Promise<boolean> | null = null;

  /**
   * Load Babel from CDN if not already loaded
   */
  async loadBabel(): Promise<boolean> {
    // First check if Babel is already available globally (from HTML script tag)
    if ((window as any).Babel) {
      console.log('✅ Babel already available globally');
      this.babelLoaded = true;
      return true;
    }

    if (this.babelLoaded) {
      return true;
    }

    if (this.loadingPromise) {
      return this.loadingPromise;
    }

    this.loadingPromise = new Promise(async (resolve, reject) => {
      try {
        console.log('🚀 Loading Babel from CDN...');
        
        const script = document.createElement('script');
        script.src = 'https://unpkg.com/@babel/standalone@7.25.2/babel.min.js';
        
        script.onload = () => {
          console.log('✅ Babel loaded successfully from CDN');
          this.babelLoaded = true;
          resolve(true);
        };

        script.onerror = (error) => {
          console.error('❌ Failed to load Babel from CDN:', error);
          this.babelLoaded = false;
          reject(new Error('Failed to load Babel from CDN'));
        };

        document.head.appendChild(script);
      } catch (error) {
        console.error('❌ Error loading Babel:', error);
        this.babelLoaded = false;
        reject(error);
      }
    });

    return this.loadingPromise;
  }

  /**
   * Check if Babel is already loaded
   */
  isBabelLoaded(): boolean {
    return this.babelLoaded || !!(window as any).Babel;
  }

  /**
   * Compile TypeScript code to JavaScript
   */
  async compileTypeScript(code: string): Promise<BabelCompileResult> {
    try {
      await this.loadBabel();

      const babel = (window as any).Babel;
      if (!babel) {
        throw new Error('Babel is not loaded');
      }

      console.log('🔧 Compiling TypeScript...');
      
      const result = babel.transform(code, { 
        presets: [
          ['typescript', { isTSX: false, allExtensions: false }],
          ['env', { targets: { browsers: ['last 2 versions'] } }]
        ],
        filename: 'script.ts'
      });

      return {
        code: result.code || '',
        success: true
      };
    } catch (error) {
      console.error('❌ TypeScript compilation failed:', error);
      return {
        code: code, // Fallback to original code
        success: false,
        error: error instanceof Error ? error.message : String(error)
      };
    }
  }

  /**
   * Compile React/JSX code to JavaScript
   */
  async compileReact(code: string, typeScript = false): Promise<BabelCompileResult> {
    try {
      console.log('🚀 [BABEL] Starting React compilation...');
      console.log('🚀 [BABEL] TypeScript:', typeScript);
      console.log('🚀 [BABEL] Input code:', code.substring(0, 100));
      
      await this.loadBabel();

      const babel = (window as any).Babel;
      console.log('🚀 [BABEL] Babel object:', babel ? 'EXISTS' : 'NULL');
      
      if (!babel) {
        console.error('❌ [BABEL] Babel is not loaded!');
        throw new Error('Babel is not loaded');
      }

      console.log(`🔧 [BABEL] Compiling React (${typeScript ? 'TypeScript' : 'JavaScript'})...`);
      
      // Prepare code by handling exports and making components globally available
      const modifiedCode = code
        .replace(/export default /g, 'const exportedComponent = ')
        .replace(/export /g, 'const ')
        + '\n\n// Make components globally available\n'
        + 'if (typeof exportedComponent !== "undefined") {\n'
        + '  window.exportedComponent = exportedComponent;\n'
        + '}\n'
        + 'if (typeof App !== "undefined") {\n'
        + '  window.App = App;\n'
        + '}';
      
      console.log('🔧 [BABEL] Modified code:', modifiedCode.substring(0, 100));
      
      // Configure presets
      const presets: any[] = [];
      if (typeScript) {
        presets.push(['typescript', { isTSX: true, allExtensions: false }]);
      }
      presets.push(['react', { runtime: 'classic' }]);
      presets.push(['env', { targets: { browsers: ['last 2 versions'] } }]);
      
      console.log('🔧 [BABEL] Presets:', JSON.stringify(presets));
      
      console.log('🔧 [BABEL] Calling babel.transform...');
      const result = babel.transform(modifiedCode, { 
        presets,
        filename: typeScript ? 'component.tsx' : 'component.jsx'
      });

      console.log('✅ [BABEL] Transform complete!');
      console.log('✅ [BABEL] Result code length:', result.code?.length || 0);
      console.log('✅ [BABEL] Result code preview:', result.code?.substring(0, 200) || 'EMPTY');

      if (!result.code) {
        throw new Error('Babel returned empty code');
      }

      return {
        code: result.code,
        success: true
      };
    } catch (error) {
      console.error('❌ [BABEL] React compilation FAILED!');
      console.error('❌ [BABEL] Error:', error);
      console.error('❌ [BABEL] Error message:', error instanceof Error ? error.message : String(error));
      console.error('❌ [BABEL] Error stack:', error instanceof Error ? error.stack : 'No stack');
      
      // DO NOT return original code - throw the error!
      throw error;
    }
  }
}

// Export singleton instance
export const babelService = new BabelServiceImpl();

// Helper functions for common use cases
export const loadBabelScript = () => babelService.loadBabel();
export const compileTypeScript = (code: string) => babelService.compileTypeScript(code);
export const compileReact = (code: string, typeScript = false) => babelService.compileReact(code, typeScript);
export const isBabelAvailable = () => babelService.isBabelLoaded();

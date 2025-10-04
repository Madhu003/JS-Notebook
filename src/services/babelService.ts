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
    if (this.babelLoaded) {
      return true;
    }

    if (this.loadingPromise) {
      return this.loadingPromise;
    }

    this.loadingPromise = new Promise(async (resolve, reject) => {
      try {
        // Check if Babel is already available globally
        if ((window as any).Babel) {
          this.babelLoaded = true;
          resolve(true);
          return;
        }

        console.log('🚀 Loading Babel from CDN...');
        
        const script = document.createElement('script');
        script.src = 'https://unpkg.com/@babel/standalone@7.28.4/babel.min.js';
        
        script.onload = () => {
          console.log('✅ Babel loaded successfully');
          this.babelLoaded = true;
          resolve(true);
        };

        script.onerror = (error) => {
          console.error('❌ Failed to load Babel:', error);
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
        presets: ['typescript', 'env'],
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
      await this.loadBabel();

      const babel = (window as any).Babel;
      if (!babel) {
        throw new Error('Babel is not loaded');
      }

      console.log(`🔧 Compiling React (${typeScript ? 'TypeScript' : 'JavaScript'})...`);
      
      // Prepare code by handling exports
      const modifiedCode = code
        .replace(/export default /g, 'const exportedComponent = ')
        .replace(/export /g, 'const ');
      
      // Configure presets
      const presets: any[] = [];
      if (typeScript) {
        presets.push('typescript');
      }
      presets.push(['react', { runtime: 'classic' }]);
      
      const result = babel.transform(modifiedCode, { 
        presets,
        filename: typeScript ? 'component.tsx' : 'component.jsx'
      });

      return {
        code: result.code || '',
        success: true
      };
    } catch (error) {
      console.error('❌ React compilation failed:', error);
      return {
        code: code, // Fallback to original code
        success: false,
        error: error instanceof Error ? error.message : String(error)
      };
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

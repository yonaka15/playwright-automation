// src/utils/browser/BrowserManager.ts
import { chromium, Browser, Page } from 'playwright';

/**
 * BrowserManager - シングルトンクラスでブラウザインスタンスを管理
 * サーバー起動時に単一のブラウザウィンドウを開き、維持する
 */
export class BrowserManager {
  private static instance: BrowserManager;
  private browser: Browser | null = null;
  private page: Page | null = null;
  private isInitializing: boolean = false;
  private initPromise: Promise<void> | null = null;

  // プライベートコンストラクタでインスタンス生成を制限
  private constructor() {}
  
  /**
   * シングルトンインスタンスを取得
   */
  public static getInstance(): BrowserManager {
    if (!BrowserManager.instance) {
      BrowserManager.instance = new BrowserManager();
    }
    return BrowserManager.instance;
  }
  
  /**
   * ブラウザの初期化
   * すでに初期化中または初期化済みの場合は既存のインスタンスを返す
   */
  public async initialize(
    options: { headless?: boolean; viewportWidth?: number; viewportHeight?: number } = {}
  ): Promise<void> {
    if (this.browser && this.page) {
      return; // すでに初期化されている
    }
    
    if (this.isInitializing) {
      // 初期化中の場合は、初期化が完了するのを待つ
      if (this.initPromise) {
        return this.initPromise;
      }
    }
    
    this.isInitializing = true;
    
    // 初期化プロミスを作成
    this.initPromise = (async () => {
      try {
        // デフォルトのビューポートサイズ
        const viewportWidth = options.viewportWidth || 1280;
        const viewportHeight = options.viewportHeight || 800;
        
        // ブラウザの起動
        this.browser = await chromium.launch({
          headless: options.headless !== undefined ? options.headless : false
        });
        
        // ページの作成とビューポートサイズの設定
        this.page = await this.browser.newPage();
        await this.page.setViewportSize({
          width: viewportWidth,
          height: viewportHeight
        });
        
        console.log(`Browser initialized with viewport ${viewportWidth}x${viewportHeight}`);
      } catch (error) {
        console.error('Failed to initialize browser:', error);
        this.browser = null;
        this.page = null;
        throw error;
      } finally {
        this.isInitializing = false;
      }
    })();
    
    return this.initPromise;
  }
  
  /**
   * ブラウザを閉じる
   */
  public async shutdown(): Promise<void> {
    if (this.browser) {
      try {
        await this.browser.close();
        console.log('Browser closed successfully');
      } catch (error) {
        console.error('Error closing browser:', error);
      } finally {
        this.browser = null;
        this.page = null;
        this.initPromise = null;
      }
    }
  }
  
  /**
   * 現在のブラウザインスタンスを取得
   */
  public getBrowser(): Browser | null {
    return this.browser;
  }
  
  /**
   * 現在のページインスタンスを取得
   */
  public getPage(): Page | null {
    return this.page;
  }
  
  /**
   * ブラウザの状態を確認し、必要に応じて再初期化
   */
  public async ensureBrowser(options?: { headless?: boolean; viewportWidth?: number; viewportHeight?: number }): Promise<void> {
    if (!this.browser || !this.page) {
      console.log('Browser not initialized, initializing now');
      await this.initialize(options);
    }
  }
  
  /**
   * URLに遷移
   */
  public async goTo(
    url: string, 
    options: { timeout?: number; waitUntil?: 'load' | 'domcontentloaded' | 'networkidle' } = {}
  ): Promise<void> {
    await this.ensureBrowser();
    
    if (!this.page) {
      throw new Error('Page not available');
    }
    
    const navigationOptions = {
      timeout: options.timeout || 30000,
      waitUntil: options.waitUntil || 'domcontentloaded'
    };
    
    try {
      console.log(`Navigating to ${url}`);
      await this.page.goto(url, navigationOptions);
      console.log(`Navigation to ${url} completed`);
    } catch (error) {
      console.error(`Error navigating to ${url}:`, error);
      throw error;
    }
  }
  
  /**
   * ページのスクリーンショットを撮影
   */
  public async takeScreenshot(fullPage: boolean = true): Promise<Buffer> {
    await this.ensureBrowser();
    
    if (!this.page) {
      throw new Error('Page not available');
    }
    
    return await this.page.screenshot({ fullPage });
  }
  
  /**
   * 現在のページのHTMLコンテンツを取得
   */
  public async getContent(): Promise<string> {
    await this.ensureBrowser();
    
    if (!this.page) {
      throw new Error('Page not available');
    }
    
    return await this.page.content();
  }
  
  /**
   * ページでスクリプトを実行
   */
  public async evaluateScript(script: string): Promise<any> {
    await this.ensureBrowser();
    
    if (!this.page) {
      throw new Error('Page not available');
    }
    
    try {
      // スクリプトがreturnで始まるかどうかを確認
      if (script.trim().startsWith('return ')) {
        return await this.page.evaluate(`(function() { ${script} })()`);
      } else {
        // returnで始まらない場合は、returnを追加
        return await this.page.evaluate(`(function() { return ${script} })()`);
      }
    } catch (error) {
      console.error('Error evaluating script:', error);
      throw error;
    }
  }
  
  /**
   * 高度なスクリプト実行（Pageオブジェクトを使用）
   */
  public async runAdvancedScript(scriptFn: (page: Page) => Promise<any>): Promise<any> {
    await this.ensureBrowser();
    
    if (!this.page) {
      throw new Error('Page not available');
    }
    
    try {
      console.log('Attempting to execute advanced script...');
      
      // スクリプト実行の前にシンプルなテストを実行してページの状態を確認
      const pageTitle = await this.page.title();
      console.log('Current page title:', pageTitle);
      
      // 代替手段：直接評価を実行
      try {
        // まず、直接ページの評価を試してみる
        const directResult = await this.page.evaluate(() => document.title);
        console.log('Direct evaluation result:', directResult);
      } catch (evalError) {
        console.error('Direct evaluation failed:', evalError);
      }
      
      // 提供されたスクリプト関数を実行
      console.log('Executing provided script function...');
      const result = await scriptFn(this.page);
      console.log('Script execution raw result:', result);
      
      // スクリプト関数が何も返さない場合の対応
      // undefinedの場合でも明示的に返す
      if (result === undefined) {
        console.log('Script returned undefined, converting to null for JSON');
        return null;
      }
      
      return result;
    } catch (error) {
      console.error('Error running advanced script:', error);
      console.error('Error details:', error instanceof Error ? error.stack : String(error));
      
      // エラーをスローする代わりに、エラー情報を結果として返す
      return {
        error: true,
        message: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined
      };
    }
  }
  
  /**
   * ビューポートサイズを変更
   */
  public async setViewportSize(width: number, height: number): Promise<void> {
    await this.ensureBrowser();
    
    if (!this.page) {
      throw new Error('Page not available');
    }
    
    await this.page.setViewportSize({ width, height });
    console.log(`Viewport size set to ${width}x${height}`);
  }
}
// ===== 设备指纹 (Canvas Fingerprint + localStorage 持久化) =====
const Fingerprint = {
  STORAGE_KEY: 'miltest_device_fp',
  async get() {
    // iOS Safari 关闭浏览器后 Canvas 渲染/UA 存在差异，每次重算会导致指纹变化被当成新设备；
    // 因此首次算好后持久化到 localStorage，之后直接复用同一指纹
    try {
      const cached = localStorage.getItem(this.STORAGE_KEY);
      if (cached && (cached.length === 64 || /^fp_[0-9a-f]{8,}$/.test(cached))) return cached;
    } catch (e) {}

    let fp = '';
    try {
      const canvas = document.createElement('canvas');
      canvas.width = 256;
      canvas.height = 128;
      const ctx = canvas.getContext('2d');

      ctx.textBaseline = 'top';
      ctx.font = '14px Arial';
      ctx.fillStyle = '#f60';
      ctx.fillRect(0, 0, 256, 128);
      ctx.fillStyle = '#fff';
      ctx.font = '18px SimHei';
      ctx.fillText('FP:' + navigator.userAgent, 4, 20);
      ctx.font = '16px Arial';
      ctx.fillStyle = '#0066cc';
      ctx.fillText('SoldierTest:' + screen.width + 'x' + screen.height, 4, 50);

      ctx.beginPath();
      ctx.arc(180, 80, 30, 0, Math.PI * 2);
      ctx.strokeStyle = '#ffcc00';
      ctx.lineWidth = 3;
      ctx.stroke();

      ctx.beginPath();
      ctx.rect(40, 70, 60, 40);
      ctx.fillStyle = 'rgba(0,102,204,0.3)';
      ctx.fill();

      ctx.beginPath();
      ctx.moveTo(20, 100);
      ctx.lineTo(100, 20);
      ctx.lineTo(200, 100);
      ctx.strokeStyle = '#27ae60';
      ctx.lineWidth = 2;
      ctx.stroke();

      const dataUrl = canvas.toDataURL();
      fp = await this._sha256(dataUrl);
    } catch (e) {
      const fallback = navigator.userAgent + '|' + screen.width + 'x' + screen.height + '|' + new Date().getTimezoneOffset();
      fp = this._simpleHash(fallback);
    }

    try { localStorage.setItem(this.STORAGE_KEY, fp); } catch (e) {}
    return fp;
  },

  async _sha256(str) {
    const encoder = new TextEncoder();
    const data = encoder.encode(str);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  },

  _simpleHash(str) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const chr = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + chr;
      hash |= 0;
    }
    return 'fp_' + Math.abs(hash).toString(16).padStart(8, '0');
  }
};

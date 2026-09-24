// ==========================================================
// 极简数学公式渲染器 — 将题面/选项中 \(...\) 或 $...$ 内的 LaTeX 子集渲染为 HTML
// 支持: \dfrac{}{} \frac{}{} \sqrt{} \times \div \cdot \le \ge \ne \pm \in
//       \left \right \{ \} \Delta \infty 以及 上标 ^ 下标 _（含 {组}）
// 其余文本保持原样（HTML 已转义），不引入外部依赖，兼容 CSP
// ==========================================================
(function(){
  var SYM = {
    times:'×', div:'÷', cdot:'·', le:'≤', ge:'≥', ne:'≠', pm:'±', mp:'∓',
    in:'∈', to:'→', approx:'≈', cdots:'…', infty:'∞', Delta:'Δ',
    alpha:'α', beta:'β', gamma:'γ', pi:'π', mu:'μ', theta:'θ', lambda:'λ'
  };

  function esc(s){
    return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
  }

  // 递归下降解析 LaTeX 子集 → HTML
  function renderLatex(src){
    var i=0, len=src.length;

    function skipSp(){ while(i<len && (src[i]===' '||src[i]==='\t')) i++; }

    function readGroup(){
      if(src[i]!=='{') return null;
      i++;
      var g=expr();
      if(src[i]==='}') i++;
      return g;
    }

    function readAtom(){
      skipSp();
      if(i>=len) return '';
      var c=src[i];
      if(c==='{'){ i++; var g=expr(); if(src[i]==='}') i++; return g; }
      if(c==='}'||c==='^'||c==='_') return '';
      if(c==='\\'){
        var m=src.substr(i).match(/^\\([a-zA-Z]+|[\{\}])/);
        if(m){
          i+=m[0].length;
          var cmd=m[1];
          if(cmd==='dfrac'||cmd==='frac'){
            var n=readGroup(), d=readGroup();
            if(n!==null && d!==null) return '<span class="mse-math-frac"><span class="mse-math-n">'+n+'</span><span class="mse-math-d">'+d+'</span></span>';
            return '\\'+cmd;
          }
          if(cmd==='sqrt'){
            var r=readGroup();
            if(r!==null) return '<span class="mse-math-sqrt"><span class="mse-math-rad">'+r+'</span></span>';
            return '\\sqrt';
          }
          if(cmd==='left'||cmd==='right') return '';
          if(cmd==='{') return '{';
          if(cmd==='}') return '}';
          if(SYM[cmd]!==undefined) return SYM[cmd];
          return '\\'+cmd;
        }
        i++;
        return '';
      }
      i++;
      return esc(c==='-'?'−':c);
    }

    function expr(){
      var out=[];
      while(i<len && src[i]!=='}'){
        var atom=readAtom();
        if(atom==='') continue;
        while(i<len && (src[i]==='^'||src[i]==='_')){
          var kind=src[i]==='^'?'sup':'sub'; i++;
          var arg=(src[i]==='{')?readGroup():readAtom();
          if(arg===null||arg==='') arg='&nbsp;';
          atom=atom+'<'+kind+'>'+arg+'</'+kind+'>';
        }
        out.push(atom);
      }
      return out.join('');
    }

    return expr();
  }

  function render(str){
    if(str===null||str===undefined) return '';
    str=String(str);
    if(str.indexOf('\\(')<0 && str.indexOf('$')<0) return esc(str);
    var out='', last=0, m;
    var re=/\\\(([\s\S]*?)\\\)|\$([\s\S]*?)\$/g;
    while((m=re.exec(str))!==null){
      out+=esc(str.slice(last,m.index));
      out+='<span class="mse-math">'+renderLatex(m[1]!==undefined?m[1]:m[2])+'</span>';
      last=re.lastIndex;
    }
    out+=esc(str.slice(last));
    return out;
  }

  window.MathRender={ render:render };
})();

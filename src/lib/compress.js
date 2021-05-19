// takes a 1152 element array b and turns into a short base64 string
export function bytecompress(b) {
  // swizzle b->bo
  var bo=new Uint8Array(1552);
  for (var i=0;i<1552;i++) bo[i]=b[(i%97)*16+((i/97)|0)];
  var bc=[];
  for (var i=0;i<1552;) {
    var from=i;
    for (;i<1552 && i<from+255 && (bo[i]|| bo[i+1]);++i);
    bc.push(i-from);
    for (var j=from;j<i;++j) bc.push(bo[j]);
    from=i;
    for (;i<1552 && i<from+255 && !bo[i];++i);
    bc.push(i-from);  
  }
  return btoa(String.fromCharCode.apply(null, bc));
}
// takes a short base64 string and returns a 1152 element Uint8Array
export function bytedecompress(s) {
  var xx=atob(s).split('').map(function (c) { return c.charCodeAt(0); });
  var o=[];
  for (var i=0;i<xx.length;) {
    var len=xx[i++];
    for (var j=0;j<len;++j) o.push(xx[i++]);
    len=xx[i++];
    for (var j=0;j<len;++j) o.push(0);
  }
  // unswizzle o->b
  var b=new Uint8Array(1552);
  for (var i=0;i<1552;i++) b[(i%97)*16+((i/97)|0)]=o[i]|0;    
  return b;  
}
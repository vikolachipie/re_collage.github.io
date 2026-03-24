const cloudName = "dm0ywct3j"; 
const uploadPreset = "archive"; 
let canvas; 
let currentColor = '#000000';

// NAVIGATION
window.showSection = function(sectionId) {
    document.querySelectorAll('.content-section').forEach(s => s.style.display = 'none');
    const target = document.getElementById(sectionId);
    if (target) {
        target.style.display = 'block';
        if (sectionId === 'archive') loadGallery();
        if (sectionId === 'creer') initCanvas();
    }
};

// INITIALISATION CANVAS
function initCanvas() {
    if (canvas) return; 
    canvas = new fabric.Canvas('stickerCanvas', {
        backgroundColor: '#ffffff',
        width: 1169, // A4 horizontal (pixels)
        height: 1654, // A4 vertical (pixels)
        fireRightClick: true,
        stopContextMenu: true
    });

    setTimeout(fitStickerToScreen, 100);

    // GESTION ZOOM
    canvas.on('mouse:wheel', function(opt) {
        let delta = opt.e.deltaY;
        let zoom = canvas.getZoom();
        zoom *= 0.999 ** delta;
        if (zoom > 5) zoom = 5;
        if (zoom < 0.01) zoom = 0.01; 
        canvas.zoomToPoint({ x: opt.e.offsetX, y: opt.e.offsetY }, zoom);
        opt.e.preventDefault();
        opt.e.stopPropagation();
    });

    // GESTION PAN (Déplacement)
    canvas.on('mouse:down', function(opt) {
        if (opt.e.altKey || opt.e.button === 2) {
            this.isDragging = true;
            this.lastPosX = opt.e.clientX;
            this.lastPosY = opt.e.clientY;
        }
    });
    canvas.on('mouse:move', function(opt) {
        if (this.isDragging) {
            let vpt = this.viewportTransform;
            vpt[4] += opt.e.clientX - this.lastPosX;
            vpt[5] += opt.e.clientY - this.lastPosY;
            this.requestRenderAll();
            this.lastPosX = opt.e.clientX;
            this.lastPosY = opt.e.clientY;
        }
    });
    canvas.on('mouse:up', function() { this.isDragging = false; });
}

// FIT TO SCREEN
window.fitStickerToScreen = function() {
    if (!canvas) return;
    const ws = document.querySelector('.sticker-workspace');
    const zoom = Math.min((ws.offsetWidth - 50) / 1169, (ws.offsetHeight - 50) / 1654);
    canvas.setZoom(zoom);
    const vpt = canvas.viewportTransform;
    vpt[4] = (ws.offsetWidth / 2) - (1169 * zoom / 2);
    vpt[5] = (ws.offsetHeight / 2) - (1654 * zoom / 2);
    canvas.requestRenderAll();
};

// TOOLS (Formes, Texte, Menus)
window.toggleMenu = function(id) {
    document.querySelectorAll('.tool-dropdown').forEach(d => { if(d.id !== id) d.classList.remove('show'); });
    document.getElementById(id).classList.toggle('show');
};

window.addShape = function(type) {
    const center = canvas.getVpCenter();
    const props = { left: center.x, top: center.y, fill: currentColor, originX:'center', originY:'center' };
    let obj;
    if(type==='rect') obj = new fabric.Rect({...props, width:200, height:200});
    if(type==='circle') obj = new fabric.Circle({...props, radius:100});
    if(type==='star') obj = new fabric.Polygon([{x:10,y:0},{x:12,y:7},{x:20,y:7},{x:14,y:11},{x:16,y:18},{x:10,y:14},{x:4,y:18},{x:6,y:11},{x:0,y:7},{x:8,y:7}], {...props, scaleX:15, scaleY:15});
    canvas.add(obj);
};

window.updateLiveText = function() {
    const val = document.getElementById('textInput').value;
    const center = canvas.getVpCenter();
    const text = new fabric.IText(val || "Texte", {
        left: center.x, top: center.y, fill: currentColor,
        fontFamily: document.getElementById('fontFamily').value,
        fontSize: parseInt(document.getElementById('fontSize').value),
        originX:'center', originY:'center'
    });
    canvas.add(text);
};

window.setGlobalColor = (c) => { 
    currentColor = c; 
    if(canvas.getActiveObject()) { canvas.getActiveObject().set('fill', c); canvas.renderAll(); }
};

window.setBgColor = () => { canvas.setBackgroundColor(currentColor, canvas.renderAll.bind(canvas)); };
window.clearAll = () => { if(confirm("Reset ?")) canvas.clear(); canvas.setBackgroundColor('#fff', canvas.renderAll.bind(canvas)); };

window.downloadSticker = function() {
    const link = document.createElement('a');
    link.download = 'sticker.jpg';
    link.href = canvas.toDataURL({ format: 'jpeg', quality: 0.9 });
    link.click();
};

// ... Ajoute tes fonctions loadGallery() et uploadPhoto() ici ...

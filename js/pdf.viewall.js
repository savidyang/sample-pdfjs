var pdfDoc = null,
    pageNum = 1,
    pageRendering = false,
    pageNumPending = null,
    scale = 1.5,
    canvasId='viewer_canvas',
    pdfurl=null;

jQuery(function($) {
    document.getElementById('viewer_percent').addEventListener('change', onPercentChange);
});

function onPercentChange() {
	var vc = document.getElementById('viewerContainer');
	while(vc.hasChildNodes()){  
        vc.removeChild(vc.firstChild);  
    } 
    var vp = document.getElementById('viewer_percent');
    var per = vp.options[vp.options.selectedIndex].value;
    if(pdfurl!=null){
    	loadPdfViewall(pdfurl,per);
    }
}

//创建Canvas
function createPdfContainer(id, className) {
	var pdfContainer = document.getElementById('viewerContainer');
	var canvasNew = document.createElement('canvas');
	canvasNew.id = id;
	canvasNew.className = className;
	pdfContainer.appendChild(canvasNew);
};

//渲染pdf，建议给定pdf宽度
function renderPDF(pdf, i, id,scale) {
	pdf.getPage(i).then(function(page) {

		var viewport = page.getViewport(scale);

		//
		//  准备用于渲染的 canvas 元素
		//
		var canvas = document.getElementById(id);
		var context = canvas.getContext('2d');
		canvas.height = viewport.height;
		canvas.width = viewport.width;

		//
		// 将 PDF 页面渲染到 canvas 上下文中
		//
		var renderContext = {
			canvasContext: context,
			viewport: viewport
		};
		page.render(renderContext);
	});
};

//创建和pdf页数等同的canvas数
function createSeriesCanvas(num, template) {
	var id = '';
	for(var j = 1; j <= num; j++) {
		id = template + j;
		createPdfContainer(id, 'pdfClass');
	}
}

//主方法，读取pdf文件，并加载到页面中
function loadPdfViewall(url,initper,filename) {
	pdfurl = url;
	document.getElementById('viewer_loading').textContent = "文件加载中......";

    if(filename!=null&&filename!=undefined){
        document.getElementById('viewer_title').textContent = "预览文件："+filename;
    }
    if(initper!=null&&initper!=undefined){
        //var per = vp.options[vp.options.selectedIndex].value/100;
        var per = initper/100;
        scale = per.toFixed(2);
    }
    var vp = document.getElementById('viewer_percent');
    for(var i=0;i<vp.options.length;i++){
        if(vp.options[i].value==(scale*100)){
            vp.options.selectedIndex = i;
        }
    }
	PDFJS.getDocument(url).then(function(pdfbyte) {
		pdfDoc = pdfbyte;
		document.getElementById('viewer_loading').textContent = "";
        document.getElementById('viewer_page_count').textContent = pdfDoc.numPages;
        
		//用 promise 获取页面
		var id = '';
		var idTemplate = 'viewer_canvas_';
		var pageNum = pdfbyte.numPages;
		
		//根据页码创建画布
		createSeriesCanvas(pageNum, idTemplate);
		//将pdf渲染到画布上去
		for(var i = 1; i <= pageNum; i++) {
			id = idTemplate + i;
			renderPDF(pdfbyte, i, id,scale);
		}

	});
}
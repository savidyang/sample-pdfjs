var pdfDoc = null,
    pageNum = 1,
    pageRendering = false,
    pageNumPending = null,
    scale = 1.5,
    canvasId='viewer_canvas';

jQuery(function($) {
    document.getElementById('viewer_prev').addEventListener('click', onPrevPage);
    document.getElementById('viewer_next').addEventListener('click', onNextPage);
    document.getElementById('viewer_page_num').addEventListener('keypress', onPageNumEnter);
    document.getElementById('viewer_percent').addEventListener('change', onPercentChange);
});

//主方法
function loadPdfViewer(url,initper,filename){
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

        // Initial first page rendering
        if(!pageRendering){
            renderPage(1);
        }
    }, function (reason) {
        // PDF loading error
        console.error(reason);
    });
}

//渲染页面
function renderPage(num) {
    pageRendering = true;
    document.getElementById('viewer_loading').textContent = "页面渲染中......";
    // Using promise to fetch the page
    pdfDoc.getPage(num).then(function(page) {

        var viewport = page.getViewport(scale);
        var canvas = document.getElementById(canvasId);
        var context = canvas.getContext('2d');
        canvas.height = viewport.height;
        canvas.width = viewport.width;

        // Render PDF page into canvas context
        var renderContext = {
            canvasContext: context,
            viewport: viewport
        };
        var renderTask = page.render(renderContext);

        // Wait for rendering to finish
        renderTask.promise.then(function() {
            document.getElementById('viewer_loading').textContent = "";
            pageRendering = false;
            if (pageNumPending !== null) {
                // New page rendering is pending
                renderPage(pageNumPending);
                pageNumPending = null;
            }
        });
    }, function (reason) {
        // PDF loading error
        console.error(reason);
    });

    // Update page counters
    document.getElementById('viewer_page_num').value = num;
}

function queueRenderPage(num) {
    if (pageRendering) {
        pageNumPending = num;
    } else {
        renderPage(num);
    }
}

function onPrevPage() {
    if (pageNum <= 1) {
        return;
    }
    pageNum--;
    queueRenderPage(pageNum);
}


function onNextPage() {
    if (pageNum >= pdfDoc.numPages) {
        return;
    }
    pageNum++;
    queueRenderPage(pageNum);
}

function onPageNumEnter(event) {
    pageNum = parseInt(document.getElementById('viewer_page_num').value);
    if(event.keyCode == 13) {
        if (pageNum < 1 || pageNum > pdfDoc.numPages) {
            return;
        }
        queueRenderPage(pageNum);
    }
}

function onPercentChange() {
    var vp = document.getElementById('viewer_percent');
    var per = vp.options[vp.options.selectedIndex].value/100;
    scale = per.toFixed(2);
    queueRenderPage(pageNum);
}



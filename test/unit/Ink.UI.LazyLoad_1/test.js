
Ink.requireModules(['Ink.UI.LazyLoad_1', 'Ink.Dom.Element_1', 'Ink.Dom.Css_1', 'Ink.Dom.Event_1', 'Ink.Dom.Selector_1'], function (LazyLoad, InkElement, Css, InkEvent, Selector) {
    function makeContainer(options) {
        var container = InkElement.create('div', {
            className: 'container ' + (options.className || ''),
            style: 'display: none',
            insertBottom: document.body
        });

        return container;
    }

    function testLazyLoad(name, testBack, options) {
        options = options || {};
        test(name, function () {
            var sandbox = sinon.sandbox.create();
            var container = makeContainer(options);
            for (var i = 0; i < 3; i++) {
                container.appendChild(InkElement.create('div', {
                    className: 'lazyload-item test-div test-div-' + i,
                    "data-src": 'data-src-' + i
                }));
            }
            if (options.disableThrottle) { sandbox.stub(InkEvent, 'throttle', function (f) {return f}) }
            var component = new LazyLoad(container, Ink.extendObj({
            }, options || {}));
            try {
                testBack.call(sandbox, component, container, container.children);
                sandbox.restore()
            } catch(e) {
                sandbox.restore();
                throw e;
            }
        });
    }

    testLazyLoad('When LazyLoad is initted, LazyLoad_1.elInViewport is called when element is deemed to be in viewport.', function(ll, cont) {
        this.spy(ll, '_elInViewport');
        this.stub(InkElement, 'inViewport').withArgs(Ink.s('.test-div-0', cont)).returns(true);
        ll.reload();
        equal(ll._elInViewport.callCount, 1, 'One of the elements is in the viewport, so it was called only once');
    }, { autoInit: false, disableThrottle: true });

    testLazyLoad('When an element is in the viewport, its [data-src] goes to [src]', function (ll, cont) {
        var div2 = Ink.s('.test-div-2', cont);
        var src = div2.getAttribute('data-src');
        this.stub(InkElement, 'inViewport').withArgs(div2).returns(true);
        ll.reload();
        equal(div2.getAttribute('src'), src);
    }, { autoInit: false, disableThrottle: true });
});

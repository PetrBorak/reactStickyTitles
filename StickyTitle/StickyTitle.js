import PropTypes from 'prop-types';
import React, { Component } from 'react';
import './StickyTitle.styl';

class StickyTitle extends Component {
  constructor(props) {
    super(props);
    this.state = {
      sticky: false,
      transition: false,
      transitionTop: null
    };
  }

  componentDidMount() {
    this.hasBeenMounted = true;
    this.calculateDimensions();
    this.setupDimensions();
    window.addEventListener('scroll', (e) => {
      this.onScroll(e);
    });
    window.addEventListener('resize', (e) => {
      this.onResize(e);
    });
  }

  componentWillReceiveProps() {
    if (this.hasBeenMounted) {
      setTimeout(() => {
        this.calculateDimensions();
      }, 0);
    }
  }

  shouldComponentUpdate(nextProps, nextState) {
    return ((nextState.sticky !== this.state.sticky) ||
    (nextState.transition !== this.state.transition));
  }

  componentDidUpdate() {
    this.setupDimensions();
  }

  componentWillUnmount() {
    this.siblings = null;
    this.nextSibling = null;
    this.container = null;
    this.thisEl = null;
    this.hasBeenMounted = false;
    window.removeEventListener('scroll', this.onScroll);
    window.removeEventListener('scroll', this.onResize);
  }

  onScroll(e) {
    /* eslint-disable no-mixed-operators */
    if (this.hasBeenMounted) {
      // need to recalculate at this place, due to transitions in the parent components
      this.getSiblings();
      const el = this.thisEl;
      this.checkForTransform(el);
      const padding = this.props.padding;

      if (
        (
          (
            !this.thisEl.querySelector('[data-sticky-type="filler"]') &&
            ((this.getDocumentScrollTop() + this.shifted + padding) >=
            this.computeOffsetToWindow(el))
          ) ||
          (
            this.thisEl.querySelector('[data-sticky-type="filler"]') &&
            ((this.getDocumentScrollTop() + this.shifted + padding) >=
            this.computeOffsetToWindow(this.thisEl.querySelector('[data-sticky-type="filler"]')))
          )
        ) &&
        (
          (
            this.nextSibling &&
            (
              (this.computeOffsetToWindow(this.nextSibling.parentElement) -
              el.offsetHeight - padding - this.shifted) >=
              this.getDocumentScrollTop()
            )

          ) || !this.nextSibling
        ) &&
        (
          (
            this.computeOffsetToWindow(this.container) +
            this.container.offsetHeight - el.offsetHeight - this.shifted - padding
          ) >= this.getDocumentScrollTop()
        ) &&
        (
          (this.computeOffsetToWindow(this.container) - this.shifted - padding) <=
          this.getDocumentScrollTop()
        )

      ) {
        this.setState({
          sticky: true,
          transition: false,
          previous: window.getComputedStyle(this.mainContentNode).getPropertyValue('position'),
          direction: this.getScrollDirection()
        });
      } else if (
        (
          this.nextSibling &&
          (
            (this.computeOffsetToWindow(this.nextSibling.parentElement)) <=
            (this.getDocumentScrollTop() + this.shifted + this.thisEl.offsetHeight + padding)
          )
        ) ||
        (
            (this.computeOffsetToWindow(this.container) +
            this.container.offsetHeight - el.offsetHeight - padding) <=
            (this.getDocumentScrollTop() + this.shifted)
        )
      ) {
        /* eslint-disable no-nested-ternary */
        const position = this.nextSibling ? ((this.computeOffsetToWindow(this.container) +
          this.container.offsetHeight) <
          this.computeOffsetToWindow(this.nextSibling.parentElement)
            ? (this.computeOffsetToWindow(this.container) + this.container.offsetHeight -
            this.thisEl.offsetHeight -
            this.computeOffsetToWindow(this.thisEl.offsetParent) -
            padding)
            : this.computeOffsetToWindow(this.nextSibling.parentElement) -
            this.thisEl.offsetHeight -
            this.computeOffsetToWindow(this.thisEl.offsetParent) -
            padding
          )
          : (this.computeOffsetToWindow(this.container) + this.container.offsetHeight -
          this.thisEl.offsetHeight - this.computeOffsetToWindow(this.thisEl.offsetParent) -
          padding
          );
        /* eslint-enable */
        this.setState({
          sticky: false,
          transition: true,
          transitionTop: position
        });
      } else {
        this.setState({
          sticky: false,
          transition: false,
          direction: this.getScrollDirection()
        });
      }
    }
    /* eslint-enable */
  }

  onResize(e) {
    if (this.hasBeenMounted) {
      this.calculateDimensions();
      this.forceUpdate();
      this.setupDimensions();
    }
  }

  getDocumentScrollTop() {
    return (
      window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop || 0
    );
  }

  setDocumentScrollTop(val) {
    [window.pageYOffset, document.documentElement.scrollTop, document.body.scrollTop]
      .forEach((item, index, array) => {
        if (item) array[index] = val;
      });
  }

  getScrollDirection() {
    this.prevScroll = this.recentScroll;
    this.recentScroll = this.getDocumentScrollTop();
    return this.prevScroll > this.recentScroll;
  }

  setupDimensions() {
    const el = this.mainContentNode;
    this.checkForTransform(el);
    el.removeAttribute('style');
    //eslint-disable-next-line
    this.fillerNode && this.fillerNode.removeAttribute('style');
    this.contentNode.removeAttribute('style');
    this.contentNode.style.paddingBottom = '1px';

    if (this.state.sticky || this.state.transition) {
      this.contentNode.style.paddingTop = `${this.props.padding}px`;
      el.style.backgroundColor = this.props.backgroundColor;
      el.querySelector('.dc-sticky-content').style.backgroundColor = this.props.backgroundColor;
      el.style.width = `${this.containerWidth}px`;

      if (!this.state.transition) {
        el.style.top = `${this.shifted || 0}px`;
      }
      if (this.state.transition) {
        el.style.position = 'absolute';
        el.style.top = `${this.state.transitionTop}px`;
      }

    } else {
      el.removeAttribute('style');
    }
  }

  getSiblings() {
    const siblings = document.querySelectorAll(
      `[data-component=dc-sticky-${this.props.group}]:not([data-sticky-type="filler"])`);
    this.siblings = siblings;
    const thisEl = this.wrapperNode;

    const thisIndex = Array.prototype.indexOf.call(
      siblings, thisEl.querySelector(
        `[data-component=dc-sticky-${this.props.group}]:not([data-sticky-type="filler"])`
      )
    );

    this.nextSibling = siblings[thisIndex + 1];
    this.isLast = thisIndex === siblings.length - 1;
    this.container = this.findContainer(thisEl);
    this.containerWidth = this.container.offsetWidth;
    this.thisEl = thisEl;


    return this.siblings;
  }

  checkForTransform(el) {
    let current = el;
    while (current) {
      if (window.getComputedStyle(current).getPropertyValue('transform') !== 'none') {
        current.style.transform = 'none';
      }
      current = current.parentElement;
    }
  }

  findContainer(el) {
    let current = el;
    while (current = current.parentNode) {
      if (current.getAttribute &&
        (current.getAttribute('data-component') === this.props.container)
      ) {
        break;
      }
    }
    return current;
  }

  calculateDimensions() {
    if (this.hasBeenMounted) {
      this.getSiblings();
      //eslint-disable-next-line
      this.shifted = document.querySelector(this.props.toolBarQuery) ? (window.getComputedStyle(
          document.querySelector(this.props.toolBarQuery)
        )
          .getPropertyValue('position') === 'fixed' || window.getComputedStyle(
          document.querySelector(this.props.toolBarQuery).offsetParent
        )
          .getPropertyValue('position') === 'fixed')
          ? document.querySelector(this.props.toolBarQuery).offsetHeight : 0
        : 0;
    }
  }

  computeOffsetToWindow(el) {
    let currentEl = el;
    let originalPositionInTheViewport = currentEl.offsetTop;
    while (currentEl) {
      if (!(currentEl.offsetParent)) break;
      currentEl = currentEl.offsetParent;
      originalPositionInTheViewport += currentEl.offsetTop;
    }
    return originalPositionInTheViewport;
  }

  render() {
    const sticky = this.state.sticky;
    const transition = this.state.transition;

    const classes = ['dc-sticky'];
    const wrapperClasses = ['dc-sticky-wrapper'];

    if (sticky) {
      classes.push('dc-sticky-fixed');
      wrapperClasses.push('dc-sticky-decor');
    }
    if (transition) {
      classes.push('dc-sticky-transition');
      wrapperClasses.push('dc-sticky-decor');
    }

    const filler = (sticky || transition) ? (
      <div
        data-sticky-type="filler"
        data-component={`dc-sticky-${this.props.group}`}
        className="dc-sticky dc-sticky-filler"
        ref={(input) => { this.fillerNode = input; }}
      >
        <div
          className="dc-sticky-content dc-sticky-content-filler"
        >
          {this.props.children}
        </div>
      </div>
  ) : (<noscript />);

    return (
      <div
        className={wrapperClasses.join(' ')}
        ref={(input) => { this.wrapperNode = input; }}
      >
        {filler}
        <div
          data-sticky-type="mainContent"
          data-component={`dc-sticky-${this.props.group}`}
          className={classes.join(' ')}
          ref={(input) => { this.mainContentNode = input; }}
        >
          <div
            className="dc-sticky-content"
            ref={(input) => { this.contentNode = input; }}
          >
            {this.props.children}
          </div>
        </div>
      </div>
    );
  }
}

StickyTitle.propTypes = {
  sticky: PropTypes.bool,
  group: PropTypes.string.isRequired,
  container: PropTypes.string.isRequired,
  height: PropTypes.number,
  backgroundColor: PropTypes.string,
  toolBarQuery: PropTypes.string,
  children: PropTypes.element.isRequired,
  padding: PropTypes.number
};

StickyTitle.defaultProps = {
  sticky: false,
  height: 60,
  backgroundColor: '#fff',
  toolBarQuery: '#toolbar',
  padding: 16
};

StickyTitle.displayName = 'StickyTitle';

export default StickyTitle;

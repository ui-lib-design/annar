// @ts-nocheck

import * as React from 'react';
import { useState, useEffect } from 'react';
import { View, createSelectorQuery } from 'remax/alipay';
import classNames from 'classnames'
import styles from './index.module.scss'


class SwipeAction extends React.Component {

  constructor(props) {
    super(props)
    this.startX = null
  }

  state = {
    origin: 0,
    x: 0,
    transition: 'none',
  }

  componentDidMount = async () => {
    this.setActionsWidth()
  }

  componentWillReceiveProps = async (nextProps) => {
    if (nextProps.isOpened !== this.props.isOpened) {
      const width = Number(`-${this.actionsWidth}`)
      this.setState({
        origin: nextProps.isOpened ? width : 0,
        x: nextProps.isOpened ? width : 0,
        transition: 'all 0.3s'
      })
    }
  }

  handleTouchStart = (e) => {
    // touch当前行时关闭其他行
    this.props.onTouchStart()
    const touch = e.touches[0]
    this.startX = touch.pageX
    this.setState({
      transition: 'none'
    })
  }

  handleTouchMove = (e) => {
    // 节流
    this.throttleTouchMove(e)
  }

  handleTouchEnd = () => {
    const  { x, origin } = this.state
    const width = Number(`-${this.actionsWidth}`)
    if (x >= 0) {
      return
    }
    if (x > origin) {
      this.props.onClosed()
      this.setState({
        x: 0,
        origin: 0,
        transition: 'all 0.3s'
      })
      return
    }
    let x2 = 0
    let origin2 = 0
    if (x <= -30) {
      x2 = width
      origin2 = width
      this.props.onOpened()
    }
    if (x > -30) {
      x2 = 0
      origin2 = 0
      this.props.onClosed()
    }
    this.setState({
      x: x2,
      origin: origin2,
      transition: 'all 0.3s'
    })
  }

  handleTouchCancel = () => {
    const width = Number(`-${this.actionsWidth}`)
    this.setState({
      x: width,
      origin: width,
    })
  }

  throttle = (fn, delay) => {
    let pre = 0
    return function() {
      const now = Date.now()
      if (now - pre > delay) {
        fn.apply(this, arguments)
        pre = now
      }
    }
  }

  throttleTouchMove = this.throttle((e) => {
    const { origin } = this.state
    const touch = e.touches[0]
    const currenrX = touch.pageX
    let diff = currenrX - this.startX
    let total = diff + origin
    if (total >= 0) {
      return
    }
    this.setState({
      x: total,
    })
  }, 30)

  setActionsWidth = async () => {
    createSelectorQuery()
    .select('.class_swipeAction .class_actions')
    .boundingClientRect( async (rect) => {
      this.actionsWidth = rect.width
    })
    .exec()
  }

  handleDelete = (item) => {
    item.onClick()
  }

  render() {
    const { options = [] } = this.props
    const { transition, x } = this.state
    return (
      <View
        className={classNames({
          [styles.swipeAction]: true,
          'class_swipeAction': true
        })}
        style={options && options[options.length - 1] && options[options.length - 1].style}
      >
        <View
          className={styles.container}
          onTouchStart={this.handleTouchStart}
          onTouchMove={this.handleTouchMove}
          onTouchEnd={this.handleTouchEnd}
          onTouchCancel={this.handleTouchCancel}
          style={{
            // transform: `translateX(${x}PX)`,  //使用transform或导致子级内的fixed直接降级为absolute
            left: `${x}PX`,
            transition,
          }}
        >
          {this.props.children}
          <View
            className={classNames({
              [styles.actions]: true,
              'class_actions': true
            })}
          >
            {
              options.map((item, index) => (
                <View
                  key={index}
                  className={styles.action}
                  onClick={() => this.handleDelete(item)}
                  style={item.style}
                >
                  {item.text}
                </View>
              ))
            }
          </View>
        </View>
      </View>
    )
  }
}

export default SwipeAction;
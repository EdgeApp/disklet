// @flow

import React, { Component } from 'react'
import { AppRegistry, StyleSheet, Text, View } from 'react-native'

import { logDisklet, makeReactNativeDisklet } from '../src/index.js'
import { testDisklet } from './common.js'

type Props = {}
type State = { status: string }

export default class DiskletTest extends Component<Props, State> {
  constructor (props: Props) {
    super(props)
    this.state = {
      status: 'Testing...'
    }
  }

  async componentDidMount () {
    try {
      const disklet = logDisklet(makeReactNativeDisklet())

      await testDisklet(disklet)
      console.log('Success')
      this.setState({ status: 'Success' })
    } catch (e) {
      console.log(e)
      this.setState({ status: 'Failed' })
    }
  }

  render () {
    return (
      <View style={styles.container}>
        <Text style={styles.status}>{this.state.status}</Text>
      </View>
    )
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5FCFF'
  },
  status: {
    fontSize: 20,
    textAlign: 'center',
    margin: 10
  }
})

AppRegistry.registerComponent('disklet', () => DiskletTest)

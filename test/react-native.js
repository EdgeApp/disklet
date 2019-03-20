// @flow

import React, { Component } from 'react'
import { SafeAreaView, StatusBar, StyleSheet, Text, View } from 'react-native'

import { logDisklet, makeReactNativeDisklet } from '../src/index.js'
import { tests } from './common.js'

type Props = {}
type State = { [name: string]: void | true | string }

export default class DiskletTest extends Component<Props, State> {
  constructor (props: Props) {
    super(props)
    this.state = {}
  }

  componentDidMount () {
    this.runTests()
  }

  async runTests () {
    for (const name in tests) {
      const disklet = logDisklet(makeReactNativeDisklet())
      await tests[name](disklet)
        .then(
          ok => {
            this.setState({ [name]: true })
            return disklet.delete('.')
          },
          error => {
            console.log(error)
            this.setState({ [name]: String(error) })
            return disklet.delete('.')
          }
        )
        .catch(error => {
          console.log(error)
          this.setState({ [name]: String(error) })
        })
    }
  }

  renderStatusLine (name: string, status: void | true | string) {
    if (status == null) {
      return (
        <Text key={name} style={styles.running}>
          Running "{name}"
        </Text>
      )
    }
    if (status === true) {
      return (
        <Text key={name} style={styles.good}>
          Passed "{name}"
        </Text>
      )
    }
    return (
      <Text key={name} style={styles.bad}>
        Failed "{name}" ({status})
      </Text>
    )
  }

  render () {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle='light-content' translucent />
        <Text style={styles.header}>Disklet Tests</Text>
        <View style={styles.results}>
          {Object.keys(tests).map(name =>
            this.renderStatusLine(name, this.state[name])
          )}
        </View>
      </SafeAreaView>
    )
  }
}

const testStyle = (color: string) => ({
  color,
  margin: 5
})

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#205030',
    flex: 1,
    paddingTop: StatusBar.currentHeight
  },
  header: {
    color: '#ffffff',
    fontSize: 20,
    padding: 5,
    textAlign: 'center'
  },
  results: {
    backgroundColor: '#ffffff',
    flex: 1
  },
  running: testStyle('#000000'),
  bad: testStyle('#7f4f30'),
  good: testStyle('#307f4f')
})

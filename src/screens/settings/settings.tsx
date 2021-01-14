import * as React from 'react'
import {Container, Content, List, ListItem, Text} from 'native-base'
import {NavigationInjectedProps} from 'react-navigation'
import {Screens} from '../../screens'

export interface SettingsProps extends NavigationInjectedProps<any> {

}

export const Settings: React.FC<SettingsProps> = (props: SettingsProps) => {
  return (
    <Container>
      <Content>
        <Text>Settings</Text>
        <List>
          <ListItem onPress={() => props.navigation.navigate(Screens.STUDENTS)}><Text>Учні</Text></ListItem>
          <ListItem><Text>Класи</Text></ListItem>
          <ListItem><Text>Предмети</Text></ListItem>
        </List>
      </Content>
    </Container>
  )
}

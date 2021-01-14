import * as React from 'react'
import {
  Body,
  Button,
  Container,
  Content,
  Header,
  Icon,
  Left,
  List,
  ListItem,
  Right,
  Subtitle,
  Text,
  Title,
} from 'native-base'
import { NavigationInjectedProps } from 'react-navigation'
import { useQuery } from '@apollo/react-hooks'
import { gql } from 'apollo-boost'

import { Screens } from '../../screens'
import { Student } from '../../interfaces'

interface Props extends NavigationInjectedProps<any> {

}

const STUDENTS = gql`
  {
    students {
      firstName
      lastName
      phone
      id
    }
  }
`

interface StudentsQueryData {
  students: Student[]
}

export const Students: React.FC<Props> = (props: Props) => {
  const { loading, error, data } = useQuery<StudentsQueryData>(STUDENTS)
  const addStudentHandler = React.useCallback(
    () => props.navigation.navigate(Screens.ADD_STUDENT), [])

  if (loading) return <Text>Loading...</Text>
  if (error) return <Text>Error :(</Text>
  if (!data) return <Text>No data to display...</Text>

  const StudentsItems = data.students.map(student => (
    <ListItem key={student.id}><Text>{student.lastName} {student.firstName}</Text></ListItem>
  ))
  return (
    <Container>
      <Header>
        <Left/>
        <Body>
          <Title>Учні</Title>
          <Subtitle>Subtitle</Subtitle>
        </Body>
        <Right>
          <Button transparent={true} onPress={addStudentHandler}>
            <Icon name='add'/>
          </Button>
        </Right>
      </Header>
      <Content>
        <List>
          {StudentsItems}
        </List>
      </Content>
    </Container>
  )
}

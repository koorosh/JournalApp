import * as React from 'react'
import { useEffect } from 'react'
import {
  Body,
  Button,
  CheckBox,
  Container,
  Content,
  DatePicker, Header, Left,
  List,
  ListItem,
  Picker, Right,
  Segment,
  Text, Title,
} from 'native-base'
import { NavigationInjectedProps } from 'react-navigation'
import { gql } from 'apollo-boost'
import { useLazyQuery, useMutation, useQuery } from '@apollo/react-hooks'

import { Reasons, Group, Subject, Student } from '../../interfaces'

const INITIAL_DATA = gql`
  {
    subjects {
      id
      name
    }

    groupsThisYear {
      id
      name
      year
    }
  }
`

const STUDENTS_IN_GROUP = gql`
  query studentsInGroup($groupId: ID!) {
    studentsInGroup(groupId: $groupId) {
      person {
        firstName
        lastName
        phone
      }
      id
    }
  }
`

const CREATE_ATTENDANCE = gql`
  mutation createGroupAttendanceReport(
    $groupId: ID!
    $subjectId: ID!
    $lessonNo: Int!
    $date: Date!
    $absentStudentIds: [StudentAbsenceReasonMap]!
  ) {
      createGroupAttendanceReport(
        attendanceReport: {
          groupId: $groupId,
          subjectId: $subjectId,
          lessonNo: $lessonNo,
          date: $date,
          absentStudentIds: $absentStudentIds
        }) {
        id
      }
    }
`

const lessonsNo = [1, 2, 3, 4, 5, 6, 7]

// tslint:disable-next-line:no-empty-interface
interface AttendanceProps extends NavigationInjectedProps {}

export const Attendance: React.FC<AttendanceProps> = (props: AttendanceProps) => {
  interface StudentsMap {
    [studentId: string]: Reasons | undefined
  }

  interface StudentsQueryData {
    studentsInGroup: Student[]
  }

  interface InitialQueryData {
    subjects: Subject[]
    groupsThisYear: Group[]
  }

  const {
    error,
    loading,
    data,
  } = useQuery<InitialQueryData>(INITIAL_DATA)

  const { subjects = [], groupsThisYear: groups = [] } = (data || {})

  const [
    queryStudents,
    {
      loading: studentsIsLoading,
      error: studentsError,
      data: {
        studentsInGroup: students = [],
      } = {},
    },
  ] = useLazyQuery<StudentsQueryData>(STUDENTS_IN_GROUP)

  const [selectedDate, setDate] = React.useState<Date>(new Date())
  const [selectedSubjectId, setSelectedSubjectId] = React.useState<Subject>()
  const [selectedGroupId, setSelectedGroupId] = React.useState<Group>()
  const [selectedLessonNo, setSelectedLessonNo] = React.useState(1)
  const [selectedStudents, setSelectedStudents] = React.useState<StudentsMap>({})

  useEffect(() => {
    if (!selectedGroupId) return
    queryStudents({
      variables: { groupId: selectedGroupId },
    })
  }, [selectedGroupId])

  const toggleStudentSelection = (reason: Reasons, studentId: string) => {
    setSelectedStudents(prevState => ({
      ...prevState,
      [studentId]: prevState[studentId] === reason ? undefined : reason,
    }))
  }

  const [saveAttendance] = useMutation(CREATE_ATTENDANCE, {
    variables: {
      groupId: selectedGroupId,
      subjectId: selectedSubjectId,
      lessonNo: selectedLessonNo,
      date: selectedDate,
      absentStudentIds: Object.entries(selectedStudents)
        .filter(([_, reason]) => reason !== undefined)
        .map(([studentId, absenceReason]) => ({ studentId, absenceReason })),
    },
  })

  const onSubmit = React.useCallback(() => {
    saveAttendance()
      .then(() => props.navigation.goBack())
  }, [selectedDate, selectedSubjectId, selectedLessonNo, selectedStudents, selectedGroupId])

  if (loading) return <Text>Is Loading</Text>
  if (error) return <Text>{error.message}</Text>

  return (
    <Container>
      <Header>
        <Left>
          <Button transparent>
            <Text>Відминити</Text>
          </Button>
        </Left>
        <Body>
          <Title>Перекличка</Title>
        </Body>
        <Right>
          <Button transparent onPress={onSubmit}>
            <Text>Зберегти</Text>
          </Button>
        </Right>
      </Header>
      <Content>
        <DatePicker
          defaultDate={selectedDate}
          maximumDate={new Date()}
          locale={'ua'}
          timeZoneOffsetInMinutes={undefined}
          modalTransparent={false}
          animationType={'fade'}
          androidMode={'default'}
          placeHolderText={selectedDate.toLocaleDateString()}
          onDateChange={setDate}
          disabled={false}
        />
        <Segment>
          {
            lessonsNo.map((lessonNo, idx) =>
              (
                <Button
                  key={idx}
                  first={idx === 0}
                  last={idx === lessonsNo.length - 1}
                  active={lessonNo === selectedLessonNo}
                  onPress={() => setSelectedLessonNo(lessonNo)}
                >
                  <Text>{lessonNo}</Text>
                </Button>
              ),
            )
          }
        </Segment>
        <Picker
          mode='dropdown'
          placeholder='Виберіть предмет'
          note={false}
          selectedValue={selectedSubjectId}
          onValueChange={setSelectedSubjectId}
        >
          {
            subjects.map(subject => (
              <Picker.Item key={subject.id} label={subject.name} value={subject.id}/>
            ))
          }
        </Picker>
        <Picker
          mode='dropdown'
          placeholder='Виберіть клас'
          note={false}
          selectedValue={selectedGroupId}
          onValueChange={setSelectedGroupId}
        >
          {
            groups.map(group => (
              <Picker.Item key={group.id} label={group.name} value={group.id}/>
            ))
          }
        </Picker>
        <List>
          {
            students.map(student => (
              <ListItem
                key={student.id}
              >
                <Body>
                  <Text>{student.person.firstName} {student.person.lastName}</Text>
                </Body>
                <CheckBox
                  checked={selectedStudents[student.id] === Reasons.UNKNOWN}
                  onPress={() => toggleStudentSelection(Reasons.UNKNOWN, student.id)}
                />
                <CheckBox
                  checked={selectedStudents[student.id] === Reasons.ILLNESS}
                  onPress={() => toggleStudentSelection(Reasons.ILLNESS, student.id)}
                />
                <CheckBox
                  checked={selectedStudents[student.id] === Reasons.OTHER}
                  onPress={() => toggleStudentSelection(Reasons.OTHER, student.id)}
                />
              </ListItem>
            ))
          }
        </List>
      </Content>
    </Container>
  )
}

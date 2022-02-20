import { StatusBar } from "expo-status-bar";
import { useEffect, useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Alert,
} from "react-native";
import { Fontisto } from "@expo/vector-icons";
import { FontAwesome } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { theme } from "./colors";

const STORAGE_KEY = "@toDos";
const LIST_TYPE = "@listType";

export default function App() {
  const [working, setWorking] = useState(true);
  const [text, setText] = useState();
  const [toDos, setToDos] = useState({});

  useEffect(() => {
    getListType();
    loadToDos();
  }, []);

  const travel = () => setListType(false);
  const work = () => setListType(true);
  const onChangeText = (payload) => setText(payload);
  const handleChangeText = ({ key, text }) => {
    setToDos({
      ...toDos,
      [key]: { ...toDos[key], text },
    });
  };

  const saveToDos = async (toSave) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(toSave));
    } catch (error) {
      console.log(error);
    }
  };

  const loadToDos = async () => {
    const s = await AsyncStorage.getItem(STORAGE_KEY);
    if (s) {
      setToDos(JSON.parse(s));
    }
  };

  const setListType = async (value) => {
    setWorking(value);
    await AsyncStorage.setItem(LIST_TYPE, JSON.stringify(value));
  };

  const getListType = async () => {
    const s = await AsyncStorage.getItem(LIST_TYPE);
    s ? setListType(JSON.parse(s)) : setListType(true);
  };

  const addToDo = async () => {
    if (text === "") {
      return;
    }
    const newToDos = { ...toDos, [Date.now()]: { text, working } };
    setToDos(newToDos);
    await saveToDos(newToDos);
    setText("");
  };

  const completeToDo = (key) => {
    toDos[key] = { ...toDos[key], isComplete: !toDos[key].isComplete };
    const newToDos = { ...toDos, [key]: toDos[key] };
    setToDos(newToDos);
    saveToDos(newToDos);
  };

  const editToDo = (key) => {
    toDos[key] = { ...toDos[key], isEdit: true };
    const newToDos = { ...toDos, [key]: toDos[key] };
    setToDos(newToDos);
    saveToDos(newToDos);
  };

  const handleSubmitEditing = async (key) => {
    if (toDos[key].text === "") return;
    toDos[key] = { ...toDos[key], isEdit: false };

    const newToDos = {
      ...toDos,
      [key]: toDos[key],
    };
    setToDos(newToDos);
    await saveToDos(newToDos);
  };

  const deleteToDo = async (key) => {
    Alert.alert("Delete To Do?", "Are you sure?", [
      { text: "Cancel" },
      {
        text: "I'm sure",
        style: "destructive",
        onPress: () => {
          const newToDos = { ...toDos };
          delete newToDos[key];
          setToDos(newToDos);
          saveToDos(newToDos);
        },
      },
    ]);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={work}>
          <Text
            style={{
              fontSize: 38,
              fontWeight: "600",
              color: working ? theme.white : theme.grey,
            }}
          >
            Work
          </Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={travel}>
          <Text
            style={{
              fontSize: 38,
              fontWeight: "600",
              color: working ? theme.grey : theme.white,
            }}
          >
            Travel
          </Text>
        </TouchableOpacity>
      </View>
      <TextInput
        onSubmitEditing={addToDo}
        onChangeText={onChangeText}
        returnKeyType="done"
        value={text}
        placeholder={working ? "Add a To Do" : "Where do you want to go?"}
        style={styles.input}
      />
      <ScrollView>
        {Object.keys(toDos).map((key) =>
          toDos[key].working === working ? (
            <View style={styles.toDo} key={key}>
              <TouchableOpacity onPress={() => completeToDo(key)}>
                <Text>
                  <Fontisto name="check" size={18} color={theme.grey} />
                </Text>
              </TouchableOpacity>
              {toDos[key].isEdit ? (
                <TextInput
                  onSubmitEditing={() => handleSubmitEditing(key)}
                  onChangeText={(text) => handleChangeText({ key, text })}
                  value={toDos[key].text}
                  style={styles.inputEdit}
                  returnKeyType="done"
                ></TextInput>
              ) : (
                <Text
                  style={{
                    ...styles.toDoText,
                    textDecorationLine: toDos[key].isComplete
                      ? "line-through"
                      : "none",
                  }}
                >
                  {toDos[key].text}
                </Text>
              )}
              <TouchableOpacity onPress={() => editToDo(key)}>
                <Text>
                  <FontAwesome name="pencil" size={18} color={theme.grey} />
                </Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => deleteToDo(key)}>
                <Text>
                  <Fontisto name="trash" size={18} color={theme.grey} />
                </Text>
              </TouchableOpacity>
            </View>
          ) : null
        )}
      </ScrollView>
      <StatusBar style="auto" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.bg,
    paddingHorizontal: 20,
  },
  header: {
    justifyContent: "space-between",
    flexDirection: "row",
    marginTop: 100,
  },
  input: {
    backgroundColor: "white",
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderRadius: 30,
    marginVertical: 20,
    fontSize: 18,
  },
  inputEdit: {
    flex: 0.8,
    backgroundColor: "white",
    paddingVertical: 5,
    paddingHorizontal: 5,
    borderRadius: 5,
    fontSize: 15,
    color: theme.grey,
  },
  toDo: {
    backgroundColor: theme.toDoBg,
    marginBottom: 20,
    paddingVertical: 20,
    paddingHorizontal: 20,
    borderRadius: 15,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  toDoText: {
    color: "white",
    fontSize: 16,
    fontWeight: "500",
  },
});

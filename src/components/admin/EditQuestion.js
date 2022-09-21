import React, { useEffect, useState } from "react";
import { graphql, compose, withApollo } from "react-apollo";
import gql from "graphql-tag";
import {
  listQuestions,
  listQuestionnaires,
  getQuestionnaire,
  getQuestion,
} from "../../graphql/queries";
import AdminMenu from "./index";
import Table from "@material-ui/core/Table";
import TableBody from "@material-ui/core/TableBody";
import TableCell from "@material-ui/core/TableCell";
import TableHead from "@material-ui/core/TableHead";
import TableRow from "@material-ui/core/TableRow";
import TextField from "@material-ui/core/TextField";
import Button from "@material-ui/core/Button";
import Dialog from "@material-ui/core/Dialog";
import DialogActions from "@material-ui/core/DialogActions";
import DialogContent from "@material-ui/core/DialogContent";
import DialogContentText from "@material-ui/core/DialogContentText";
import DialogTitle from "@material-ui/core/DialogTitle";
import FormControl from "@material-ui/core/FormControl";
import MenuItem from "@material-ui/core/MenuItem";
import Select from "@material-ui/core/Select";

import {
  createQuestion,
  updateQuestion,
  deleteQuestion,
} from "../../graphql/mutations";
import { makeStyles } from "@material-ui/core/styles";
import {
  FormLabel,
  Radio,
  RadioGroup,
  Typography,
  FormControlLabel,
  InputLabel,
  Breadcrumbs,
  Link,
} from "@material-ui/core";

const useStyles = makeStyles((theme) => ({
  root: {
    flexGrow: 1,
    overflow: "hidden",
    marginLeft: 120,
    marginTop: 20,
    padding: theme.spacing(0, 3),
  },
  paper: {
    maxWidth: 1000,
    margin: `${theme.spacing(3)}px auto`,
    padding: theme.spacing(5),
  },
}));
const EditQuestion = (props) => {
  const [open, setOpen] = useState(false);
  const [question, setQuestion] = useState("");
  const [type, setType] = useState("");
  const [order, setOrder] = useState(1);
  const classes = useStyles();
  const [listItemOptions, setListItemOptions] = useState([]);
  const [currentMode, setCurrentMode] = useState("normal");
  const [listItem, setListItem] = useState("");
  const [openAddListItem, setOpenAddListItem] = useState(false);
  const [nextQuestion, setNextQuestion] = useState("");
  const [nextQuestionForOther, setNextQuestionForOther] = useState("");
  const [openEdit, setOpenEdit] = useState(false);
  const [dependentQuestion, setDependentQuestion] = useState("");
  const [dependentQuestionOptions, setDependentQuestionOptions] = useState([]);
  const {
    data: { getQuestion },
  } = props.getQuestion;
  // console.log("getQuestion", props.getQuestion);

  const {
    data: { loading, error, listQuestions },
  } = props.listQuestions;

  const listoptionfind = getQuestion?.dependent?.options;

  // console.log("listoptionfind", listoptionfind);
  /*Changing new question value */
  const onTypeChange = (newValue) => {
    if (type === newValue) {
      setType(newValue);
      return;
    }
    setType(newValue);
  };

  /* Get quetion by questionID */
  const onGettingQuestionById = (id) => {
    const que = listQuestions?.items.find((q) => q?.id === id);
    console.log("listQuestions", que);
    // console.log("nextQue", que);
    return que?.qu ?? id;
  };

  /* get order by questionID*/
  const onGettingOrderById = (id) => {
    const order = listQuestions?.items.find((o) => o?.id === id);
    return order?.order ?? id;
  };
  // const onGettingQuestionById = (id) => {
  //   const que = getQuestionnaire?.question?.items?.find((q) => q?.id === id);
  //   return que?.qu ?? id;
  // };
  /*Changing question mode */
  const onModeChange = (event, newValue) => {
    setCurrentMode(newValue);
  };
  /*Changing new question value */
  const onQuestionChange = (newValue) => {
    if (question === newValue) {
      setQuestion(newValue);
      return;
    }
    setQuestion(newValue);
  };
  /* Adding List Item Options */
  const handleSettingDependentNextQuestion = (que, optionValue) => {
    const isAlreadyExisting = dependentQuestionOptions?.find(
      (option) => option?.dependentValue === optionValue
    );
    if (isAlreadyExisting) {
      setDependentQuestionOptions(
        dependentQuestionOptions?.filter(
          (option) => option?.dependentValue !== optionValue
        )
      );
    }
    setDependentQuestionOptions((prevSate) => [
      ...prevSate,
      { dependentValue: optionValue, nextQuestion: que },
    ]);
  };
  /*Closing Add List Item Options dialog */
  const handleAddListItemClose = () => {
    setOpenAddListItem(false);
  };

  /*Edit Question */
  const handleEdit = (event) => {
    event.preventDefault();
    let createQuestionQuery = {
      qu: question,
      type: type,
      order: order,
      questionQuestionnaireId: getQuestionnaire?.id,
    };
    if (currentMode === "dependent") {
      const dependentQuestionQuery = {
        id: dependentQuestion,
        options: dependentQuestionOptions,
      };
      createQuestionQuery.isDependent = true;
      createQuestionQuery.dependent = dependentQuestionQuery;
    }
    if (currentMode === "self") createQuestionQuery.isSelf = true;
    if (type && type === "TEXT") {
      if (currentMode === "self" && nextQuestionForOther) {
        createQuestionQuery.listOptions = {
          listValue: type,
          nextQuestion: nextQuestionForOther,
        };
      }
    }
    if (type && type !== "TEXT") {
      if (listItemOptions.length > 0)
        createQuestionQuery.listOptions = listItemOptions;
    }
    // console.log("createQuestionQuery", createQuestionQuery);
    props.onCreateQuestion(createQuestionQuery, getQuestionnaire?.id);
    setQuestion("");
    setOrder(1);
    setCurrentMode("normal");
    setType("");
    setNextQuestionForOther("");
    setListItem("");
    setNextQuestion("");
    setListItemOptions([]);
    setDependentQuestion("");
    setDependentQuestionOptions([]);
    setOpen(false);
  };
  return (
    <div className={classes.root}>
      <div>
        {" "}
        <AdminMenu />
        <div className={classes.root}>
          <Breadcrumbs aria-label="breadcrumb">
            <Link underline="hover" color="inherit" href="/admin">
              Admin
            </Link>
            <Link
              underline="hover"
              color="inherit"
              href="/admin/questionnaires"
            >
              {getQuestion?.questionnaire?.name}
            </Link>
            <Typography color="primary">Manage Question</Typography>
          </Breadcrumbs>
        </div>
      </div>
      <div className={classes.root}>
        <FormControl fullWidth>
          <Typography variant="h4"> Manage Question </Typography>

          <TextField
            autoFocus
            margin="dense"
            id="qu"
            label="Question"
            value={getQuestion?.qu}
            onChange={(event) => onQuestionChange(event.target.value)}
            InputLabelProps={{
              shrink: true,
            }}
            variant="outlined"
          />
        </FormControl>

        <FormControl fullWidth>
          <InputLabel>Type</InputLabel>
          <Select
            margin="dense"
            id="type"
            value={getQuestion?.type}
            onChange={(event) => onTypeChange(event.target.value)}
            // variant="outlined"
            InputLabelProps={{
              shrink: true,
            }}
          >
            <MenuItem value={"TEXT"}>Text</MenuItem>
            <MenuItem value={"RADIO"}>Radio</MenuItem>
            <MenuItem value={"CHECKBOX"}>Checkbox</MenuItem>
            {/* <MenuItem value={"LISTTEXT"}>List Text</MenuItem> */}
            {/* <MenuItem value={"CHECKBOXTEXT"}>Checkbox Text</MenuItem> */}
          </Select>
          <TextField
            fullWidth
            margin="dense"
            id="order"
            label="Order"
            type="number"
            value={getQuestion?.order}
            placeholder="Similar to question number"
            onChange={(event) => setOrder(event.target.value)}
            InputLabelProps={{
              shrink: true,
            }}
            variant="outlined"
          />

          {type === "TEXT" && getQuestion?.isSelf === true && (
            <FormControl fullWidth>
              <InputLabel>Next question</InputLabel>
              <Select
                margin="dense"
                fullWidth
                value={nextQuestionForOther}
                onChange={(event) =>
                  setNextQuestionForOther(event.target.value)
                }
              >
                {getQuestionnaire?.question?.items
                  .sort((a, b) => a?.order - b?.order)
                  .map((que, q) => (
                    <MenuItem value={que?.id} key={q}>
                      {que?.order + "  " + que?.qu}
                    </MenuItem>
                  ))}
              </Select>
            </FormControl>
          )}

          <div style={{ margin: "15px 0" }}>
            <Table className={classes.table}>
              <TableHead>
                <TableRow
                  sx={{
                    backgroundColor: "#5E8ABF",

                    "& th": {
                      color: "White",
                    },
                  }}
                >
                  <TableCell>Option</TableCell>
                  {getQuestion?.isSelf === true && (
                    <>
                      <TableCell>Question No </TableCell>
                      <TableCell>Question</TableCell>
                    </>
                  )}
                </TableRow>
              </TableHead>

              <TableBody>
                {getQuestion?.listOptions?.map((item, i) => (
                  <TableRow key={i}>
                    <TableCell>{item?.listValue}</TableCell>
                    {getQuestion?.isSelf === true && (
                      <>
                        <TableCell>
                          {onGettingOrderById(item?.nextQuestion)}
                        </TableCell>
                        <TableCell>
                          {" "}
                          {onGettingQuestionById(item?.nextQuestion)}
                        </TableCell>
                      </>
                    )}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            {getQuestion?.isDependent === true && (
              <TextField
                fullWidth
                autoFocus
                margin="dense"
                label="Dependent Question"
                value={onGettingQuestionById(getQuestion?.dependent?.id)}
                onChange={(event) => onQuestionChange(event.target.value)}
                InputLabelProps={{
                  shrink: true,
                }}
                variant="outlined"
              />
            )}
            <Table>
              {getQuestion?.isDependent === true && (
                <TableHead>
                  <TableRow
                    sx={{
                      backgroundColor: "#5E8ABF",

                      "& th": {
                        color: "White",
                      },
                    }}
                  >
                    <TableCell>Dependent Question Option</TableCell>
                    <TableCell>Question No</TableCell>
                    <TableCell>Question</TableCell>
                    {/* <TableCell>Manage</TableCell> */}
                  </TableRow>
                </TableHead>
              )}

              <TableBody>
                {listoptionfind?.map((item, i) => (
                  <TableRow key={i}>
                    <TableCell>{item?.dependentValue}</TableCell>
                    <TableCell>
                      {onGettingOrderById(item?.nextQuestion)}
                    </TableCell>
                    <TableCell>
                      {" "}
                      {onGettingQuestionById(item?.nextQuestion)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </FormControl>
      </div>
    </div>
  );
};
const Question = compose(
  graphql(gql(getQuestion), {
    options: (props) => ({
      errorPolicy: "all",
      fetchPolicy: "cache-and-network",
      variables: { id: props.match.params.editQuestionID },
    }),
    props: (props) => {
      return {
        getQuestion: props ? props : [],
      };
    },
  }),
  graphql(gql(listQuestions), {
    options: (props) => ({
      errorPolicy: "all",
      fetchPolicy: "cache-and-network",
    }),
    props: (props) => {
      return {
        listQuestions: props ? props : [],
      };
    },
  }),
  graphql(gql(getQuestionnaire), {
    options: (props) => ({
      errorPolicy: "all",
      fetchPolicy: "cache-and-network",
      variables: { id: props.match.params.questionnaire },
    }),
    props: (props) => {
      return {
        getQuestionnaire: props ? props : [],
      };
    },
  }),

  graphql(gql(updateQuestion), {
    props: (props) => ({
      onUpadateQuestion: (response) => {
        props.mutate({
          variables: {
            input: response,
          },

          update: (store, { data: { updateQuestion } }) => {
            const query = gql(listQuestions);
            const data = store.readQuery({ query });
            if (data?.listQuestions?.items?.length > 0) {
              data.listQuestions.items = [
                ...data.listQuestions.items.filter(
                  (item) => item.id !== updateQuestion.id
                ),
                createQuestion,
              ];
            }
            store.writeQuery({
              query,
              data,
              variables: { filter: null, limit: null, nextToken: null },
            });
          },
        });
      },
    }),
  })
)(EditQuestion);

export default withApollo(Question);

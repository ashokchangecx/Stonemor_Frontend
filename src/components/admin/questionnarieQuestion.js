import React, { useEffect } from "react";
import Typography from "@material-ui/core/Typography";
import { makeStyles, withStyles } from "@material-ui/core/styles";
import Table from "@material-ui/core/Table";
import TableBody from "@material-ui/core/TableBody";
import TableCell from "@material-ui/core/TableCell";
import TableHead from "@material-ui/core/TableHead";
import TableRow from "@material-ui/core/TableRow";
import Divider from "@material-ui/core/Divider";
import Paper from "@material-ui/core/Paper";
import Button from "@material-ui/core/Button";
import AddCircleIcon from "@material-ui/icons/AddCircle";
import EditIcon from "@material-ui/icons/Edit";
import DeleteIcon from "@material-ui/icons/Delete";
import CircularProgress from "@material-ui/core/CircularProgress";
import TextField from "@material-ui/core/TextField";
import Dialog from "@material-ui/core/Dialog";
import DialogActions from "@material-ui/core/DialogActions";
import DialogContent from "@material-ui/core/DialogContent";
import DialogContentText from "@material-ui/core/DialogContentText";
import DialogTitle from "@material-ui/core/DialogTitle";
import FormControl from "@material-ui/core/FormControl";
import MenuItem from "@material-ui/core/MenuItem";
import Select from "@material-ui/core/Select";
import InputLabel from "@material-ui/core/InputLabel";
import { Link } from "react-router-dom";
import TablePagination from "@material-ui/core/TablePagination";
import TableContainer from "@material-ui/core/TableContainer";

import { graphql, compose, withApollo } from "react-apollo";
import gql from "graphql-tag";
import {
  listQuestions,
  listQuestionnaires,
  getQuestionnaire,
  getQuestion,
} from "../../graphql/queries";
import {
  createQuestion,
  deleteQuestion,
  updateQuestion,
} from "../../graphql/mutations";

import AdminMenu from "./index";
import { useState } from "react";
import {
  Breadcrumbs,
  FormControlLabel,
  FormLabel,
  Radio,
  RadioGroup,
  TableFooter,
} from "@material-ui/core";

const useStyles = makeStyles((theme) => ({
  root: {
    flexGrow: 1,
    overflow: "hidden",
    marginLeft: 120,
    marginTop: 20,
    padding: theme.spacing(0, 3),
  },
  content: {
    flexGrow: 1,
    padding: theme.spacing(3),
  },
  image: {
    width: 64,
  },
  button: {
    margin: theme.spacing(1),
    marginTop: 20,
  },
  container: {
    maxHeight: 2000,
  },
}));
const StyledTableCell = withStyles((theme) => ({
  head: {
    backgroundColor: theme.palette.primary.main,
    color: theme.palette.common.white,
    fontSize: 14,
  },
  body: {
    fontSize: 14,
  },
}))(TableCell);
const StyledTableRow = withStyles((theme) => ({
  root: {
    "&:nth-of-type(even)": {
      backgroundColor: theme.palette.action.hover,
    },
  },
}))(TableRow);

const QuestionnarieQuestionPart = (props) => {
  const classes = useStyles();
  const {
    data: { loading, error, getQuestionnaire },
  } = props.getQuestionnaire;
  console.log("getQuestionnaire", getQuestionnaire);
  const [open, setOpen] = useState(false);
  const [editQuestionOpen, setEditQuestionOpen] = useState(false);
  const [question, setQuestion] = useState("");
  const [editQuestion, setEditQuestion] = useState("");
  const [order, setOrder] = useState(1);
  const [currentMode, setCurrentMode] = useState("normal");
  const [type, setType] = useState("");
  const [openAddListItem, setOpenAddListItem] = useState(false);
  const [listItemOptions, setListItemOptions] = useState([]);
  const [listItem, setListItem] = useState("");
  const [nextQuestion, setNextQuestion] = useState("");
  const [nextQuestionForOther, setNextQuestionForOther] = useState("");
  const [dependentQuestion, setDependentQuestion] = useState("");
  const [dependentQuestionOptions, setDependentQuestionOptions] = useState([]);
  const [page, setPage] = React.useState(0);
  const [rowsPerPage, setRowsPerPage] = React.useState(10);

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };
  const questionCount = getQuestionnaire?.question?.items.sort(
    (a, b) => a?.order - b?.order
  );
  console.log("questionCount", questionCount);
  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  /*Deleting question by ID*/
  const handleDelete = (id) => {
    props.onDeleteQuestion({
      id: id,
    });
  };

  /*Opening Creating new question Dialobox*/
  const handleOpenDialog = () => {
    setOpen(true);
  };

  /*Changing new question value */
  const onQuestionChange = (newValue) => {
    if (question === newValue) {
      setQuestion(newValue);
      return;
    }
    setQuestion(newValue);
  };

  /*Changing question mode */
  const onModeChange = (event, newValue) => {
    setCurrentMode(newValue);
  };

  /*Changing new question value */
  const onTypeChange = (newValue) => {
    if (type === newValue) {
      setType(newValue);
      return;
    }
    setType(newValue);
  };

  /*reSetting to initial Values */
  const onResettingInitialValues = () => {
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
  };

  /*reSetting to initial Values */
  const handleEditQuestion = (question) => {
    setEditQuestion(question?.id);
    setQuestion(question?.qu || "");
    setOrder(question?.order || 1);
    if (question?.isSelf) setCurrentMode("self");
    else if (question?.isDependent) {
      setCurrentMode("dependent");
      setDependentQuestion(question?.dependent?.id);
      setDependentQuestionOptions(question?.dependent?.options || []);
    } else setCurrentMode("normal");
    setType(question?.type || "TEXT");
    if (type === "TEXT" && currentMode === "self") {
      setNextQuestionForOther(question?.listOptions[0]?.nextQuestion);
    }

    setListItemOptions(
      question?.listOptions?.map((item) => ({
        isMultiple: item?.isMultiple,
        isText: item?.isText,
        listValue: item?.listValue,
        nextQuestion: item?.nextQuestion,
      }))
    );
    setEditQuestionOpen(true);
  };

  /*Closing create question dialog */
  const handleClose = () => {
    onResettingInitialValues();
    setOpen(false);
  };

  /*Closing Edit question dialog */
  const handleEditQuestionClose = () => {
    onResettingInitialValues();
    setEditQuestion("");
    setEditQuestionOpen(false);
  };

  /*Creating new Question */
  const handleCreate = (event) => {
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
    props.onCreateQuestion(createQuestionQuery, getQuestionnaire?.id);
    handleClose();
  };

  /*Updating Question */
  const handleUpdateQuestion = (event) => {
    event.preventDefault();
    let updateQuestionQuery = {
      id: editQuestion,
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
      updateQuestionQuery.isDependent = true;
      updateQuestionQuery.dependent = dependentQuestionQuery;
    }
    if (currentMode === "self") updateQuestionQuery.isSelf = true;
    if (type && type === "TEXT") {
      if (currentMode === "self" && nextQuestionForOther) {
        updateQuestionQuery.listOptions = {
          listValue: type,
          nextQuestion: nextQuestionForOther,
        };
      }
    }
    if (type && type !== "TEXT") {
      if (listItemOptions.length > 0)
        updateQuestionQuery.listOptions = listItemOptions;
    }
    props.onUpadateQuestion(updateQuestionQuery, getQuestionnaire?.id);
    handleEditQuestionClose();
  };

  /* Get quetion by questionID */
  const onGettingQuestionById = (id) => {
    const que = getQuestionnaire?.question?.items?.find((q) => q?.id === id);
    return que?.qu ?? id;
  };

  /* Adding List Item Options */
  const handleAddingListItemOptions = () => {
    let listQuery = {
      listValue: listItem,
    };
    if (currentMode === "self") listQuery.nextQuestion = nextQuestion;
    setListItemOptions((prevState) => [...prevState, listQuery]);
    setListItem("");
    setNextQuestion("");
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

  const EditQuestion = () => {
    return (
      <FormControl>
        <DialogTitle id="form-dialog-title">
          Edit Question - {editQuestion}
        </DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            id="qu"
            label="Question"
            value={question}
            onChange={(event) => onQuestionChange(event.target.value)}
            fullWidth
          />
          <TextField
            margin="dense"
            id="order"
            label="Order"
            type="number"
            value={order}
            placeholder="Similar to question number"
            onChange={(event) => setOrder(event.target.value)}
            fullWidth
          />
          <FormControl fullWidth>
            <FormLabel
              style={{ margin: "10px 0", color: "black" }}
              id="demo-radio-buttons-group-label"
            >
              Mode
            </FormLabel>
            <RadioGroup
              aria-labelledby="demo-radio-buttons-group-label"
              name="radio-buttons-group"
              value={currentMode}
              onChange={onModeChange}
              row
            >
              <FormControlLabel
                value="normal"
                control={<Radio />}
                label="Normal"
              />
              <FormControlLabel value="self" control={<Radio />} label="Self" />
              <FormControlLabel
                value="dependent"
                control={<Radio />}
                label="Dependent"
              />
            </RadioGroup>
          </FormControl>
          <FormControl fullWidth>
            <InputLabel>Type</InputLabel>
            <Select
              margin="dense"
              fullWidth
              value={type}
              onChange={(event) => onTypeChange(event.target.value)}
            >
              <MenuItem value={"TEXT"}>Text</MenuItem>
              <MenuItem value={"RADIO"}>Radio</MenuItem>
              <MenuItem value={"CHECKBOX"}>Checkbox</MenuItem>
              {/* <MenuItem value={"RADIO_TEXT"}>Radio with Text</MenuItem> */}
              {/* <MenuItem value={"CHECKBOXTEXT"}>Checkbox Text</MenuItem> */}
            </Select>
          </FormControl>
          {type === "TEXT" && currentMode === "self" && (
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
          {currentMode === "dependent" && (
            <>
              <FormControl fullWidth style={{ margin: "10px 0" }}>
                <InputLabel>Dependent question</InputLabel>
                <Select
                  margin="dense"
                  fullWidth
                  value={dependentQuestion}
                  onChange={(event) => setDependentQuestion(event.target.value)}
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
              {dependentQuestion &&
                getQuestionnaire?.question?.items
                  .find((q) => q.id === dependentQuestion)
                  ?.listOptions?.map((options, i) => (
                    <FormControl fullWidth style={{ margin: "3px 0" }} key={i}>
                      <InputLabel>{options?.listValue}</InputLabel>
                      <Select
                        margin="dense"
                        fullWidth
                        value={
                          dependentQuestionOptions.find(
                            (o) => o?.dependentValue === options?.listValue
                          )?.nextQuestion
                        }
                        onChange={(event) =>
                          handleSettingDependentNextQuestion(
                            event.target.value,
                            options?.listValue
                          )
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
                  ))}
            </>
          )}
          {type !== "TEXT" && (
            <>
              <TextField
                margin="dense"
                id="qu"
                label="Listitem"
                value={listItem}
                onChange={(event) => setListItem(event.target.value)}
                fullWidth
              />
              {currentMode === "self" && (
                <FormControl fullWidth>
                  <InputLabel>Next question</InputLabel>
                  <Select
                    margin="dense"
                    fullWidth
                    value={nextQuestion}
                    onChange={(event) => setNextQuestion(event.target.value)}
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
              <div style={{ margin: "8px 2px" }}>
                <Button
                  onClick={handleAddingListItemOptions}
                  type="button"
                  variant="outlined"
                  color="secondary"
                >
                  Add
                </Button>
              </div>
              {listItemOptions?.length > 0 && (
                <div style={{ margin: "15px 0" }}>
                  <Table className={classes.table}>
                    <TableHead>
                      <TableRow>
                        <TableCell>Option</TableCell>
                        {currentMode === "self" && (
                          <TableCell>Question</TableCell>
                        )}
                        <TableCell>Remove</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {listItemOptions.map((item, i) => (
                        <TableRow key={i}>
                          <TableCell>{item?.listValue}</TableCell>
                          {currentMode === "self" && (
                            <TableCell>
                              {onGettingQuestionById(item?.nextQuestion)}
                            </TableCell>
                          )}
                          <TableCell>
                            <Button
                              size="small"
                              color="primary"
                              onClick={() =>
                                setListItemOptions(
                                  listItemOptions?.filter(
                                    (i) => i?.listValue !== item?.listValue
                                  )
                                )
                              }
                            >
                              <DeleteIcon />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </>
          )}
        </DialogContent>
        <Divider />
        <DialogActions>
          <Button onClick={handleEditQuestionClose} color="default">
            Close
          </Button>
          <Button
            onClick={(event) => handleUpdateQuestion(event)}
            variant="contained"
            type="button"
            color="primary"
          >
            Update
          </Button>
        </DialogActions>
      </FormControl>
    );
  };

  /* Side effect to open List dialog */
  useEffect(() => {
    if (type && type !== "TEXT" && !editQuestion) {
      if (type === "CHECKBOX") setCurrentMode("normal");
      setOpenAddListItem(true);
    }
  }, [type]);
  if (loading) {
    return (
      <div>
        <CircularProgress className={classes.progress} />
      </div>
    );
  }
  if (error) {
    console.log(error);
    return (
      <div>
        <Paper className={classes.root}>
          <Typography variant="h5" component="h3">
            Error
          </Typography>
          <Typography component="p">
            An error occured while fetching data.
          </Typography>
          <Typography component="p">{error}</Typography>
        </Paper>
      </div>
    );
  }

  return (
    <div className={classes.root}>
      <AdminMenu />
      <div className={classes.root}>
        <Breadcrumbs aria-label="breadcrumb">
          <Typography underline="hover" color="inherit" href="/admin">
            Admin
          </Typography>
          <Typography color="primary">{getQuestionnaire?.name}</Typography>
        </Breadcrumbs>
      </div>
      <div>
        <Dialog
          fullWidth
          open={open}
          onClose={handleClose}
          aria-labelledby="form-dialog-title"
        >
          <FormControl>
            <DialogTitle id="form-dialog-title">
              Create Question - {getQuestionnaire?.name}
            </DialogTitle>
            <DialogContent>
              <TextField
                autoFocus
                margin="dense"
                id="qu"
                label="Question"
                value={question}
                onChange={(event) => onQuestionChange(event.target.value)}
                fullWidth
              />
              <TextField
                margin="dense"
                id="order"
                label="Order"
                type="number"
                value={order}
                placeholder="Similar to question number"
                onChange={(event) => setOrder(event.target.value)}
                fullWidth
              />
              <FormControl fullWidth>
                <FormLabel
                  style={{ margin: "10px 0", color: "black" }}
                  id="demo-radio-buttons-group-label"
                >
                  Mode
                </FormLabel>
                <RadioGroup
                  aria-labelledby="demo-radio-buttons-group-label"
                  name="radio-buttons-group"
                  value={currentMode}
                  onChange={onModeChange}
                  row
                >
                  <FormControlLabel
                    value="normal"
                    control={<Radio />}
                    label="Normal"
                  />
                  <FormControlLabel
                    value="self"
                    control={<Radio />}
                    label="Self"
                  />
                  <FormControlLabel
                    value="dependent"
                    control={<Radio />}
                    label="Dependent"
                  />
                </RadioGroup>
              </FormControl>
              <FormControl fullWidth>
                <InputLabel>Type</InputLabel>
                <Select
                  margin="dense"
                  fullWidth
                  value={type}
                  onChange={(event) => onTypeChange(event.target.value)}
                >
                  <MenuItem value={"TEXT"}>Text</MenuItem>
                  <MenuItem value={"RADIO"}>Radio</MenuItem>
                  <MenuItem value={"CHECKBOX"}>Checkbox</MenuItem>
                  {/* <MenuItem value={"RADIO_TEXT"}>Radio with Text</MenuItem> */}
                  {/* <MenuItem value={"CHECKBOXTEXT"}>Checkbox Text</MenuItem> */}
                </Select>
              </FormControl>

              {type === "TEXT" && currentMode === "self" && (
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

              {currentMode === "dependent" && (
                <>
                  <FormControl fullWidth style={{ margin: "10px 0" }}>
                    <InputLabel>Dependent question</InputLabel>
                    <Select
                      margin="dense"
                      fullWidth
                      value={dependentQuestion}
                      onChange={(event) =>
                        setDependentQuestion(event.target.value)
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
                  {dependentQuestion &&
                    getQuestionnaire?.question?.items
                      .find((q) => q.id === dependentQuestion)
                      ?.listOptions?.map((options, i) => (
                        <FormControl
                          fullWidth
                          style={{ margin: "3px 0" }}
                          key={i}
                        >
                          <InputLabel>{options?.listValue}</InputLabel>
                          <Select
                            margin="dense"
                            fullWidth
                            value={
                              dependentQuestionOptions.find(
                                (o) => o?.dependentValue === options?.listValue
                              )?.nextQuestion
                            }
                            onChange={(event) =>
                              handleSettingDependentNextQuestion(
                                event.target.value,
                                options?.listValue
                              )
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
                      ))}
                </>
              )}

              <br />
            </DialogContent>
            <DialogActions>
              <Button onClick={handleClose} color="default">
                Cancel
              </Button>
              <Button onClick={(event) => handleCreate(event)} color="primary">
                Create
              </Button>
            </DialogActions>
          </FormControl>
        </Dialog>
        <Dialog
          open={openAddListItem}
          onClose={handleAddListItemClose}
          aria-labelledby="form-dialog-title"
          fullWidth
        >
          <FormControl>
            <DialogTitle id="form-dialog-title">Add listitems</DialogTitle>
            <DialogContent>
              <TextField
                autoFocus
                margin="dense"
                id="qu"
                label="Listitem"
                value={listItem}
                onChange={(event) => setListItem(event.target.value)}
                fullWidth
              />
              {currentMode === "self" && (
                <FormControl fullWidth>
                  <InputLabel>Next question</InputLabel>
                  <Select
                    margin="dense"
                    fullWidth
                    value={nextQuestion}
                    onChange={(event) => setNextQuestion(event.target.value)}
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
              {listItemOptions?.length > 0 && (
                <div style={{ margin: "15px 0" }}>
                  <Table className={classes.table}>
                    <TableHead>
                      <TableRow>
                        <TableCell>Option</TableCell>
                        {currentMode === "self" && (
                          <TableCell>Question</TableCell>
                        )}
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {listItemOptions.map((item, i) => (
                        <TableRow key={i}>
                          <TableCell>{item?.listValue}</TableCell>
                          {currentMode === "self" && (
                            <TableCell>
                              {onGettingQuestionById(item?.nextQuestion)}
                            </TableCell>
                          )}
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </DialogContent>
            <DialogActions>
              <Button onClick={handleAddListItemClose} color="default">
                Close
              </Button>
              <Button
                onClick={handleAddingListItemOptions}
                type="button"
                color="primary"
              >
                Add
              </Button>
            </DialogActions>
          </FormControl>
        </Dialog>
        <Dialog
          open={editQuestionOpen}
          onClose={handleEditQuestionClose}
          aria-labelledby="form-dialog-title"
          fullWidth
        >
          <EditQuestion />
        </Dialog>
      </div>
      <main className={classes.root}>
        <Typography variant="h4">{getQuestionnaire?.name} </Typography>
        <p />
        <Paper className={classes.content}>
          <TableContainer className={classes.container}>
            <Table
              className={classes.table}
              stickyHeader
              aria-label="sticky table"
            >
              <TableHead>
                <TableRow>
                  <StyledTableCell>Question No</StyledTableCell>
                  <StyledTableCell>Question</StyledTableCell>
                  <StyledTableCell>Type</StyledTableCell>
                  <StyledTableCell>List Options</StyledTableCell>
                  <StyledTableCell>Manage</StyledTableCell>
                </TableRow>
              </TableHead>
              {(rowsPerPage > 0
                ? questionCount.slice(
                    page * rowsPerPage,
                    page * rowsPerPage + rowsPerPage
                  )
                : questionCount
              ).map((question, i) => (
                <StyledTableRow key={i}>
                  {/* {getQuestionnaire?.question?.items
                  .sort((a, b) => a?.order - b?.order)
                  .map((question, i) => ( */}
                  {/* <StyledTableRow > */}
                  <StyledTableCell component="th" scope="row">
                    {question?.order}
                  </StyledTableCell>
                  <StyledTableCell>{question.qu}</StyledTableCell>
                  <StyledTableCell>{question.type}</StyledTableCell>
                  <StyledTableCell>
                    {question.listOptions
                      ? question.listOptions.map((option, l) => (
                          <li key={l}>{option?.listValue}</li>
                        ))
                      : "(Empty)"}
                  </StyledTableCell>
                  <StyledTableCell>
                    <Button
                      size="small"
                      color="primary"
                      onClick={() => handleEditQuestion(question)}
                    >
                      <EditIcon />
                    </Button>
                    {/* <Button
                      size="small"
                      color="primary"
                      onClick={() => {
                        handleDelete(question.id);
                      }}
                    >
                      <DeleteIcon />
                    </Button> */}
                  </StyledTableCell>
                  {/* </StyledTableRow> */}
                </StyledTableRow>
              ))}
            </Table>
          </TableContainer>

          <TablePagination
            component="div"
            count={questionCount?.length}
            page={page}
            onPageChange={handleChangePage}
            rowsPerPage={rowsPerPage}
            onRowsPerPageChange={handleChangeRowsPerPage}
          />
        </Paper>
        <Button
          variant="contained"
          color="primary"
          className={classes.button}
          onClick={handleOpenDialog}
        >
          <AddCircleIcon className={classes.rightIcon} /> Add Question
        </Button>
      </main>
    </div>
  );
};

const Question = compose(
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
  graphql(gql(deleteQuestion), {
    props: (props) => ({
      onDeleteQuestion: (response) => {
        props.mutate({
          variables: {
            input: response,
          },
        });
      },
    }),
  }),
  graphql(gql(createQuestion), {
    props: (props) => ({
      onCreateQuestion: (response) => {
        props.mutate({
          variables: {
            input: response,
          },

          update: (store, { data: { createQuestion } }) => {
            const query = gql(listQuestions);
            const data = store.readQuery({ query });
            if (data?.listQuestions?.items?.length > 0) {
              data.listQuestions.items = [
                ...data.listQuestions.items.filter(
                  (item) => item.id !== createQuestion.id
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
)(QuestionnarieQuestionPart);

export default withApollo(Question);

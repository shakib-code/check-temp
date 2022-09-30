const [checked, setChecked] = useState([]);
const updateSelectedItems = (value) => {
  var updatedList = [...checked];
  if (updatedList.includes(value)) {
    updatedList.splice(checked.indexOf(event.target.value), 1);
  } else {
    updatedList = [...checked, event.target.value];
  }
  setChecked(updatedList);
};

const handleDepartmentFilterStatusChange = (valueOfCheckbox) => {
  updateSelectedItems(valueOfCheckbox);
  if (tableData) {
    const filteredData = allocationTableSkillsMapping(tableData);
    if (valueOfCheckbox == "AllSupport") {
      const supportDepartments = filteredData.filter((item) =>
        SupportDepartments.includes(item.departmentName)
      );
      setFilterTableData(supportDepartments);
    } else {
      setFilterTableData(
        filteredData.filter((item) => {
          return checked.includes(item.departmentName);
        })
      );
    }
  }
};

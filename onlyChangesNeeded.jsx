const handleDepartmentFilterStatusChange = (data) => {
  if (tableData) {
    const filteredData = allocationTableSkillsMapping(tableData);
    if (data == "AllSupport") {
      const supportDepartments = filteredData.filter((item) =>
        SupportDepartments.includes(item.departmentName)
      );
      setFilterTableData(supportDepartments);
    } else {
      setFilterTableData(
        filteredData.filter((item) => {
          return item.departmentName === data;
        })
      );
    }
  }
};

import React, { useEffect, useState, useMemo, useCallback } from "react";
import Sidenav from "Components/common/Sidebar";
import Navbar from "Components/common/Navbar";
import { useNavigate } from "react-router-dom";
import { useQuery, useQueryClient } from "react-query";
import {
  FETCH_ALL_APPROVED_ALLOCATIONS_BY_DATE_QUERY_KEY,
  FETCH_ALL_APPROVED_ALLOCATIONS_QUERY_KEY,
  GET_ALL_APPROVED_ALLOCATIONS_URL,
} from "Constants/apiConstants";
import { apiQueries } from "Axios/apiActions";
import LoadingIndicator from "Components/common/NewLoadingIndicator";
import Table from "Components/common/Table";
import dateFormat from "dateformat";
import { NavLink } from "react-router-dom";
import DateFilter from "Components/common/DateFilter";
import apiCaller from "Axios/apiCaller";
import { addDays, addMonths, parse } from "date-fns";
import {
  changeAdditionalColumnsAction,
  clearAllocationTableStateAction,
} from "redux/slices/uiSlice/allocationList";
import { useDispatch, useSelector } from "react-redux";
import clsx from "clsx";
import { allocationTableSkillsMapping } from "Helpers/skilsAtributeFilter";
import allocationHeadCount from "Helpers/allocationHeadCount";
import { SupportDepartments } from "Constants/contants";

const Allocation = () => {
  const history = useNavigate();
  const dispatch = useDispatch();

  const additionalColumns = useSelector(
    (state) => state.newUiState.allocationListPage.additionalColumns
  );

  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [dateRange, setDateRange] = useState("");
  const [statusFilters, setStatusFilters] = useState(null);
  const [departmentFilters, setDepartmentFilters] = useState(null);
  const [tableData, setTableData] = useState(null);
  const [filterTableData, setFilterTableData] = useState(null);
  const [tableFilters, setTableFilters] = useState(null);
  const [columns, setColumns] = useState([]);
  const [isEnabled, setIsEnabled] = useState(false);
  const [sheetData, setSheetData] = useState(null);
  const [initialData, setInitialData] = useState("");

  const { data, isLoading, isError } = useQuery(
    [FETCH_ALL_APPROVED_ALLOCATIONS_BY_DATE_QUERY_KEY, { dateRange }],
    apiQueries[FETCH_ALL_APPROVED_ALLOCATIONS_BY_DATE_QUERY_KEY]
  );

  useEffect(() => {
    if (startDate && endDate) {
      setDateRange(`${startDate}/${endDate}`);
    }
  }, [dateRange, startDate, endDate]);

  useEffect(() => {
    if (!isLoading && !isError) {
      setTableData(data.data.data.data);
    } else setTableData([]);
  }, [data, dateRange]);

  useEffect(() => {
    if (tableData) {
      const filteredData = allocationTableSkillsMapping(tableData).filter(
        (allocation) => !SupportDepartments.includes(allocation.departmentName)
      );
      setInitialData(filteredData);
    }
  }, [tableData]);

  const handleStatusChange = (data) => {
    if (tableData) {
      const filteredData = allocationTableSkillsMapping(tableData);
      if (data == "All") {
        setFilterTableData(
          filteredData.filter(
            (allocation) =>
              !SupportDepartments.includes(allocation.departmentName)
          )
        );
      } else {
        setFilterTableData(
          filteredData.filter((item) => item.allocationType === data)
        );
      }
    }
  };

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

  useEffect(() => {
    setStatusFilters([
      { label: "All", value: "All" },
      { label: "Billable", value: "Billable" },
      { label: "Non Billable", value: "Non Billable" },
    ]);
    setDepartmentFilters([
      { label: "All", value: "AllSupport" },
      { label: "Accounts", value: "Accounts" },
      { label: "Admin", value: "Admin" },
      { label: "Finance", value: "Finance" },
      { label: "HR", value: "HR" },
      { label: "L&D", value: "L&D" },
      { label: "Management", value: "Management" },
      { label: "Presales", value: "Presales" },
      { label: "Sales", value: "Sales" },
    ]);
  }, []);

  useEffect(() => {
    setTableFilters([
      { label: "Project Role", value: "projectRole" },
      { label: "Status", value: "status" },
      { label: "Sub Allocation Type", value: "subAllocationType" },
    ]);
  }, []);

  useEffect(() => {
    if (filterTableData) {
      setSheetData(filterTableData);
    } else setSheetData(initialData);
  }, [filterTableData, initialData]);

  const initialColumns = useMemo(() => [
    {
      Header: "Allocation ID",
      accessor: "id",
      Cell: (props) => {
        return (
          <NavLink
            to={{
              pathname: `/employee-manager/view-allocation/${props.value}`,
            }}
            style={({ isActive }) =>
              isActive ? { color: "red" } : { color: "blue", cursor: "pointer" }
            }
          >
            {props.value}
          </NavLink>
        );
      },
    },
    {
      Header: "Employee ID",
      accessor: "employeeId",
      Cell: (props) => {
        return (
          <NavLink
            to={{ pathname: `/employee-manager/view-employee/${props.value}` }}
            style={({ isActive }) =>
              isActive ? { color: "red" } : { color: "blue", cursor: "pointer" }
            }
          >
            {props.value}
          </NavLink>
        );
      },
    },
    {
      Header: "Name",
      accessor: "employeeName",
      Cell: (props) => {
        return (
          <NavLink
            to={{
              pathname: `/employee-manager/view-employee/${props.row.values.employeeId}`,
            }}
            style={({ isActive }) =>
              isActive ? { color: "red" } : { color: "blue", cursor: "pointer" }
            }
          >
            {props.value}
          </NavLink>
        );
      },
    },
    {
      Header: "Skills",
      accessor: "skills",
      // Cell: (props) => {
      //   if (props.row.original.primarySkills) {
      //     return <span>{props.row.original.primarySkills.skills}</span>;
      //   } else return "-";
      // },
    },
    {
      Header: "Project Name",
      accessor: "projectName",
    },
    {
      Header: "Allocation Type",
      accessor: "allocationType",
    },
    {
      Header: "Allocation %",
      accessor: "percentageOfAllocation",
    },
    {
      Header: "Allocation Start Date",
      accessor: "allocationStartDate",
      Cell: ({ value }) => {
        return dateFormat(value, "dd-mm-yyyy");
      },
    },
    {
      Header: "Allocation End Date",
      accessor: "allocationEndDate",
      Cell: ({ value }) => {
        let today = new Date();
        let weekAfter = addDays(today, 7);
        let halfMonth = addDays(today, 15);
        let endDate = new Date(value);
        return (
          <span
            className={clsx({
              "bg-red-600 rounded-2xl p-[2px]  px-3 font-primary text-sm text-white":
                endDate <= weekAfter && endDate >= today,
              "bg-primary rounded-2xl p-[2px]  px-3 font-primary text-sm text-white":
                endDate <= halfMonth && endDate >= weekAfter,
            })}
          >
            {dateFormat(value, "dd-mm-yyyy")}
          </span>
        );
      },
    },
  ]);
  const setTableColumns = (initialColumns) => {
    const newColumns = [...initialColumns];

    setColumns(newColumns);
  };

  const handleOnFilterSubmit = (selectedFilters) => {
    dispatch(changeAdditionalColumnsAction(selectedFilters));
  };

  useEffect(() => {
    let additionalColumnsData = additionalColumns?.map((item) => {
      return {
        Header: item.label,
        accessor: item.value,
      };
    });

    if (additionalColumns) {
      setTableColumns([...initialColumns, ...additionalColumnsData]);
    } else {
      setTableColumns([...initialColumns]);
    }
  }, [additionalColumns]);

  // clear additional columns on unmount
  useEffect(() => {
    return () => dispatch(clearAllocationTableStateAction());
  }, []);

  return (
    <div className="main min-h-screen flex flex-col">
      <Navbar />
      <div className="flex grow">
        <Sidenav
          role="/employee-manager"
          showEmployees={true}
          showProjects={true}
          showAccounts={true}
          showAllocations={true}
          showSkills={true}
          showReports={true}
        />
        <div className="grow mx-7 my-5">
          <div className="flex justify-between mb-5">
            <div className="font-extrabold text-[24px]">
              <h1>Allocations</h1>
            </div>
            <div className="flex justify-between">
              <button
                type="button"
                className="bg-white border border-black w-auto h-[36px] font-primary text-black px-5 py-1 rounded-[21px] text-sm"
                onClick={() => history("/employee-manager/pending-allocation")}
              >
                Pending Allocations
              </button>
            </div>
          </div>
          <LoadingIndicator isOpen={!!isLoading || !!isError} />
          {filterTableData && filterTableData.length >= 0 ? (
            <Table
              columns={columns}
              data={filterTableData ? filterTableData : []}
              filters={tableFilters}
              statusFilters={statusFilters}
              departmentFilters={departmentFilters}
              handleOnFilterSubmit={handleOnFilterSubmit}
              allocationHeadCount={allocationHeadCount(filterTableData)}
              handleStatusChange={handleStatusChange}
              handleDepartmentFilterStatusChange={
                handleDepartmentFilterStatusChange
              }
              allocationList={true}
              isExport={true}
              isStatus={true}
              isDepartmentFilter={true}
              sheetData={sheetData ? sheetData : []}
              fileName={"Allocation"}
              sheetName={"Allocation"}
              component={
                <div className="flex h-[100px]">
                  <DateFilter
                    handleStartDate={(date) => {
                      setStartDate(date);
                    }}
                    handleEndDate={(date) => {
                      setEndDate(date);
                    }}
                  />
                </div>
              }
            />
          ) : (
            <Table
              columns={columns}
              data={initialData ? initialData : []}
              filters={tableFilters}
              statusFilters={statusFilters}
              departmentFilters={departmentFilters}
              allocationHeadCount={allocationHeadCount(initialData)}
              handleOnFilterSubmit={handleOnFilterSubmit}
              handleStatusChange={handleStatusChange}
              handleDepartmentFilterStatusChange={
                handleDepartmentFilterStatusChange
              }
              allocationList={true}
              isExport={true}
              isStatus={true}
              isDepartmentFilter={true}
              sheetData={sheetData ? sheetData : []}
              fileName={"Allocation"}
              sheetName={"Allocation"}
              component={
                <div className="flex h-[100px]">
                  <DateFilter
                    handleStartDate={(date) => {
                      setStartDate(date);
                    }}
                    handleEndDate={(date) => {
                      setEndDate(date);
                    }}
                  />
                </div>
              }
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default Allocation;

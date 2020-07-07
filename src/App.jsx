import React, { useEffect, useState } from "react";
import moment from "moment";
import axios from "axios";
import {
  LineChart,
  Line,
  Tooltip,
  Legend,
  YAxis,
  XAxis,
  ResponsiveContainer,
  Label,
} from "recharts";
import { enGB } from "date-fns/locale";
import DatePicker from "react-datepicker";

import "react-datepicker/dist/react-datepicker.css";
import "./App.css";

const API_URL = "https://public.offset.earth/trees";

const App = () => {
  const [data, setData] = useState({ trees: [], isFetching: false });
  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(new Date());

  // Fetching data from API
  const fetchData = async () => {
    try {
      setData({ trees: [], isFetching: true });
      const response = await axios.get(API_URL);
      setData({
        trees: response.data
          // Sort by createdAt date
          .sort((a, b) => moment(a.createdAt).diff(b.createdAt))
          // Format for English humies
          .map((x) => ({
            ...x,
            createdAt: moment(x.createdAt).format("Do MMM YY"),
          })),
        isFetching: false,
      });
      // Set start date to first createdAt date (JS date obj for react-datepicker)
      setStartDate(moment(response.data[0].createdAt).toDate());
      // Set end date to last createdAt date (JS date obj for react-datepicker)
      setEndDate(moment(response.data.slice(-1)[0]).toDate());
    } catch (e) {
      console.log(e);
      setData({ trees: [], isFetching: false });
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const onStartDateChange = (date) => {
    // Set new start date
    setStartDate(date);
    // Filter out all trees created before start date
    setData({
      trees: data.trees.filter((tree) =>
        moment(tree.createdAt, "Do MMM YY").isSameOrAfter(moment(date), "day")
      ),
      isFetching: false,
    });
  };

  const onEndDateChange = (date) => {
    // Set new end date
    setEndDate(date);
    // Filter out all trees created after end date
    setData({
      trees: data.trees.filter((tree) =>
        moment(tree.createdAt, "Do MMM YY").isSameOrBefore(moment(date), "day")
      ),
      isFetching: false,
    });
  };

  if (data.isFetching) {
    return <div>Loading...</div>;
  }

  return (
    <div className="App">
      <p>From date:</p>
      <DatePicker
        selected={startDate}
        onChange={onStartDateChange}
        locale={enGB}
      />

      <p>To date:</p>
      <DatePicker selected={endDate} onChange={onEndDateChange} locale={enGB} />

      <ResponsiveContainer width="100%" height={800}>
        <LineChart width={400} height={400} data={data.trees}>
          <Line type="monotone" dataKey="value" stroke="#8884d8" />
          <XAxis dataKey="createdAt">
            <Label value="Date" offset={0} position="bottom" />
          </XAxis>
          <YAxis />
          <Tooltip />
          <Legend />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default App;

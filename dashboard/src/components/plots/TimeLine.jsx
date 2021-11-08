import React, { useEffect, useState } from 'react';
import Plot from 'react-plotly.js';
import { TimeLineRepository } from '../../repositories/timeline.repository';
import Moment from 'moment';

function TimeLine({ callback, timeRange, location }) {
  const [timeline, setTimeline] = useState([]);

  useEffect(() => {
    const repository = new TimeLineRepository();
    const loadData = async (start, end) => {
      let data;

      if (start && end) data = (await repository.getRange(start, end)).data;
      else data = (await repository.getAll()).data;

      setTimeline({
        x: data.map((item) => item.time),
        y: data.map((item) => item.numberOfMessages),
      });
    };

    loadData(timeRange.start, timeRange.end);
  }, [timeRange]);

  const updateHandler = (e) => {
    if (e['xaxis.range[0]'] && e['xaxis.range[1]'])
      callback(
        Moment(e['xaxis.range[0]']).format('YYYY-MM-DD HH:MM:ss'),
        Moment(e['xaxis.range[1]']).format('YYYY-MM-DD HH:MM:ss')
      );
  };

  return (
    <Plot
      data={[
        {
          x: timeline.x,
          y: timeline.y,
          name: 'Messages',
          autobinx: true,
          histnorm: 'count',
          marker: {
            color: '#FB8072',
            line: {
              color: '#FF5042',
              width: 1,
            },
          },
          opacity: 0.5,
          type: 'histogram',
        },
      ]}
      layout={{
        bargap: 0.02,
        bargroupgap: 0.2,
        barmode: 'stack',
        title: {
          text: 'Message Distribution',
        },
        margin: { l: 30, r: 30, t: 45, b: 45 },
        paper_bgcolor: 'transparent',
        plot_bgcolor: 'transparent',
        yaxis: {
          gridcolor: 'rgba(255,255,255,0.25)',
          gridwidth: 1,
          zerolinecolor: 'rgba(255,255,255,0.5)',
          zerolinewidth: 1,
        },
        xaxis: {
          gridcolor: 'rgba(255,255,255,0.25)',
          gridwidth: 1,
          zerolinecolor: 'rgba(255,255,255,0.5)',
          zerolinewidth: 1,
        },
        font: { color: 'white' },
        autosize: true,
        responsive: true,
        showlegend: true,
        legend: {
          orientation: 'h',
          y: 100,
        },
      }}
      style={{
        maxHeight: 200,
        margin: 0,
        padding: 0,
      }}
      onRelayout={updateHandler}
      onDoubleClick={() => callback(undefined, undefined)}
    />
  );
}

export default TimeLine;

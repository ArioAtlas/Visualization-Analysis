import { useState, useLayoutEffect } from 'react';
import Plot from 'react-plotly.js';
import Moment from 'moment';
import { ColorService } from '../../services/color-service';

function TimeLine({ update, timeRange, location, data, cluster }) {
  const [range, setRange] = useState([]);

  function useWindowSize() {
    const [size, setSize] = useState([0, 0]);
    useLayoutEffect(() => {
      function updateSize() {
        setSize([window.innerWidth, window.innerHeight]);
      }
      window.addEventListener('resize', updateSize);
      updateSize();
      return () => window.removeEventListener('resize', updateSize);
    }, []);
    return size;
  }

  const updateHandler = (e) => {
    if (e['xaxis.range[0]'] && e['xaxis.range[1]']) {
      update(
        Moment(e['xaxis.range[0]']).format('YYYY-MM-DD HH:MM:ss'),
        Moment(e['xaxis.range[1]']).format('YYYY-MM-DD HH:MM:ss')
      );
    }
    setRange([e['xaxis.range[0]'], e['xaxis.range[1]']]);
  };

  const plotData = [
    {
      x: data.main,
      name: 'Messages',
      autobins: true,
      histnorm: 'count',
      marker: {
        color: '#525252',
      },
      opacity: 1,
      type: 'histogram',
    },
  ];

  const getSelectedClusterName = () => {
    return !cluster.name || cluster.name === ''
      ? 'Selected cluster'
      : cluster.name;
  };

  if (data?.cluster) {
    plotData.push({
      x: data.cluster,
      name: getSelectedClusterName(),
      histnorm: 'count',
      marker: {
        color: ColorService.getClusterBaseColorById(cluster.id),
      },
      opacity: 1,
      type: 'histogram',
    });
  }

  if (data?.location) {
    plotData.push({
      x: data.location,
      name: location.name,
      histnorm: 'count',
      marker: {
        color: '#FFF',
      },
      opacity: 1,
      type: 'histogram',
    });
  }

  if (data?.full) {
    plotData.push({
      x: data.full,
      name: `${location.name} & ${getSelectedClusterName()}`,
      histnorm: 'count',
      marker: {
        color: ColorService.getClusterColorById(cluster.id)[5],
      },
      opacity: 1,
      type: 'histogram',
    });
  }

  const [width] = useWindowSize();

  return (
    <Plot
      data={plotData}
      // data={[{}]}
      layout={{
        bargap: 0.02,
        bargroupgap: 0.2,
        barmode: 'group',
        title: {
          text: 'Message Distribution',
        },
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
          range,
        },
        font: { color: 'white' },
        autosize: true,
        responsive: true,
        showlegend: true,
        legend: {
          orientation: 'h',
          y: 100,
        },
        margin: { pad: 5, t: 25, b: 45, r: 25, l: 50 },
      }}
      style={{
        margin: 0,
        padding: 0,
        width: width,
        height: '20vh',
      }}
      onRelayout={updateHandler}
      onDoubleClick={() => update(undefined, undefined)}
    />
  );
}

export default TimeLine;

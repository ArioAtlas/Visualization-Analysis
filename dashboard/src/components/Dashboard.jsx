import { Component } from 'react';
import { MessageRepository } from '../repositories/messages';
import { DataService } from '../services/data-service';
import TimeLine from './plots/TimeLine';
import WordCloud from './plots/WordCloud';
import SunBurst from './plots/SunBurst';
import CustomMap from './maps/CustomMap';
import Details from './Details';
import MessageMeter from './MessageMeter';

class Dashboard extends Component {
  constructor(props) {
    super(props);
    this.repository = new MessageRepository();
    this.service = DataService.getInstance();

    this.state = {
      messages: [],
      filters: {
        timeRange: {
          start: undefined,
          end: undefined,
        },
        location: {
          name: undefined,
          id: undefined,
        },
        cluster: {
          name: undefined,
          id: undefined,
        },
      },
      data: {
        wordCloud: [],
        sunburst: [],
        map: [],
        timeline: [],
        filtered: [],
      },
      layout: {
        page: 'OVERVIEW',
        map: {
          bottom: 0,
          left: '40vw',
          width: '60%',
        },
        wordCloud: {
          visible: true,
        },
        details: {
          visible: false,
        },
      },
    };
  }

  componentDidMount() {
    this.repository.getAll().then(async (res) => {
      this.service.setMessages(res.data);
      this.setState({
        messages: res.data,
        data: {
          wordCloud: await this.service.getKeywords({}),
          sunburst: await this.service.getCluster({}),
          map: await this.service.getLocations({}),
          timeline: await this.service.getTimeline({}),
          filtered: await this.service.getFilteredMessages({}),
        },
      });
    });
  }

  async rangeUpdateHandler(start, end) {
    const newFilters = {
      ...this.state.filters,
      timeRange: { start, end },
    };
    this.setState({
      filters: newFilters,
      data: {
        ...this.state.data,
        map: await this.service.getLocations(newFilters),
        wordCloud: await this.service.getKeywords(newFilters),
        filtered: await this.service.getFilteredMessages(newFilters),
      },
    });
  }

  async updateClusterHandler(name, id) {
    const newFilters = {
      ...this.state.filters,
      cluster: { name, id },
    };
    this.setState({
      filters: newFilters,
      data: {
        ...this.state.data,
        map: await this.service.getLocations(newFilters),
        wordCloud: await this.service.getKeywords(newFilters),
        timeline: await this.service.getTimeline(newFilters),
        filtered: await this.service.getFilteredMessages(newFilters),
      },
    });
  }

  async updateLocationHandler(name, id) {
    const newFilters = {
      ...this.state.filters,
      location: { name, id },
    };
    this.setState({
      filters: newFilters,
      data: {
        ...this.state.data,
        wordCloud: await this.service.getKeywords(newFilters),
        timeline: await this.service.getTimeline(newFilters),
        filtered: await this.service.getFilteredMessages(newFilters),
      },
    });
  }

  switchTab(name) {
    switch (name) {
      case 'OVERVIEW':
        this.setState({
          layout: {
            ...this.state.layout,
            page: 'OVERVIEW',
            map: {
              bottom: 0,
              left: '40vw',
              width: '60%',
            },
            wordCloud: { visible: true },
            details: {
              visible: false,
            },
          },
        });
        break;
      case 'MESSAGES':
        this.setState({
          layout: {
            ...this.state.layout,
            page: 'MESSAGES',
            map: {
              bottom: '35vh',
              left: '0vw',
              width: '40%',
            },
            wordCloud: { visible: false },
            details: {
              visible: true,
            },
          },
        });
        break;
      default:
        console.log('Invalid tab name');
    }
  }

  render() {
    return (
      <div className="dashboard">
        <div className="navigation">
          <h1>Visual Explorer</h1>
          <MessageMeter
            data={DataService.getMessageMeterData(
              this.state.data.filtered.length
            )}
          />
        </div>
        <div className="main-container">
          <div className="tabs">
            <button onClick={() => this.switchTab('OVERVIEW')}>Overview</button>
            <button onClick={() => this.switchTab('MESSAGES')}>Messages</button>
          </div>
          <div className="control">
            <WordCloud
              layout={this.state.layout}
              data={this.state.data.wordCloud}
            />
            <div className="sunburst" key="sunburst">
              <SunBurst
                data={this.state.data.sunburst}
                filters={this.state.filters}
                update={(name, id) => this.updateClusterHandler(name, id)}
              />
            </div>
          </div>

          <CustomMap
            data={this.state.data.map}
            selected={this.state.filters.location}
            layout={this.state.layout}
            update={(name, id) => this.updateLocationHandler(name, id)}
          />

          <Details
            layout={this.state.layout}
            data={this.state.data.filtered}
            location={this.state.selectedLocation}
          />
        </div>
        <div className="timeline">
          <TimeLine
            data={this.state.data.timeline}
            update={(start, end) => this.rangeUpdateHandler(start, end)}
            cluster={this.state.filters.cluster}
            location={this.state.filters.location}
          />
        </div>
      </div>
    );
  }
}

export default Dashboard;

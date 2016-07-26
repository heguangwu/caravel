import React from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import * as Actions from '../actions';
import { BootstrapTable } from 'react-bootstrap-table';
import moment from 'moment'
import Link from './Link'
import SyntaxHighlighter from 'react-syntax-highlighter';
import { github } from 'react-syntax-highlighter/dist/styles';

const STATE_COLOR_MAP = {
  failed: 'red',
  running: 'lime',
  success: 'green',
};

const QueryLog = React.createClass({
  propTypes: {
    queries: React.PropTypes.array,
  },
  getDefaultProps() {
    return {
      queries: [],
    };
  },
  render() {
    var data = this.props.queries.map((query) => {
      var q = Object.assign({}, query);
      var since = (q.endDttm) ? q.endDttm : moment();
      var duration = since.valueOf() - q.startDttm.valueOf();
      duration = moment.utc(duration);
      if (q.endDttm) {
        q.duration = duration.format('HH:mm:ss.SS');
      }
      q.started = q.startDttm.format('HH:mm:ss');
      q.sql = <SyntaxHighlighter language="sql" style={github}>{q.sql}</SyntaxHighlighter>;
      q.state = (
        <span
            className="label label-default"
            style={{'backgroundColor': STATE_COLOR_MAP[q.state]}}>
          {q.state}
        </span>
      );
      q.actions = (
        <div>
          <Link
            className="fa fa-play"
            tooltip="Pop a tab containing this query"
            href="#"/>
          <Link
            className="fa fa-trash"
            href="#"
            tooltip="Remove query from log"
            onClick={this.props.actions.removeQuery.bind(this, query)}/>
          <Link
            className="fa fa-map-pin"
            tooltip="Pin this query to the top of this query log"
            href="#"/>
        </div>
      );

      return q;
    }).reverse();
    return (
      <BootstrapTable
          condensed={true}
          data={data}>
        <TableHeaderColumn dataField="id" isKey={true} hidden={true}></TableHeaderColumn>
        <TableHeaderColumn dataField="state" width="50">state</TableHeaderColumn>
        <TableHeaderColumn dataField="started" width="50">started</TableHeaderColumn>
        <TableHeaderColumn dataField="duration" width="70">duration</TableHeaderColumn>
        <TableHeaderColumn dataField="tab">tab</TableHeaderColumn>
        <TableHeaderColumn dataField="rows">rows</TableHeaderColumn>
        <TableHeaderColumn dataField="sql">sql</TableHeaderColumn>
        <TableHeaderColumn dataField="actions" width="60">actions</TableHeaderColumn>
      </BootstrapTable>
    )
  }
});

function mapStateToProps(state) {
  return {
    queries: state.queries
  };
}
function mapDispatchToProps(dispatch) {
  return {
    actions: bindActionCreators(Actions, dispatch)
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(QueryLog)

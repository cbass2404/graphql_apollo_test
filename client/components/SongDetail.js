import React, { Component } from "react";
import { graphql } from "react-apollo";
import { Link } from "react-router";
import fetchSong from "../queries/fetchSong";
import LyricCreate from "./LyricCreate";
import LyricList from "./LyricList";

class SongDetail extends Component {
    constructor(props) {
        super(props);

        this.state = {};
    }

    render() {
        const { song } = this.props.data;
        if (!song) {
            return <div></div>;
        }

        return (
            <div>
                <Link to="/">Back</Link>
                <h3>{song.title}</h3>
                <LyricList lyrics={song.lyrics} songId={this.props.params.id} />
                <LyricCreate songId={this.props.params.id} />
            </div>
        );
    }
}

export default graphql(fetchSong, {
    options: (props) => {
        return { variables: { id: props.params.id } };
    },
})(SongDetail);

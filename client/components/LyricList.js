import React, { Component } from "react";
import { graphql } from "react-apollo";
import gql from "graphql-tag";
import fetchSongQuery from "../queries/fetchSong";

class LyricList extends Component {
    constructor(props) {
        super(props);

        this.state = {};
    }
    onLike(id, likes) {
        this.props.mutate({
            variables: { id },
            refetchQueries: [
                { query: fetchSongQuery, variables: { id: this.props.songId } },
            ],
        });
    }

    renderLyrics() {
        return this.props.lyrics.map(({ id, content, likes }) => {
            return (
                <li key={id} className="collection-item">
                    {content}
                    <div className="vote-box">
                        {likes}
                        <i
                            className="material-icons"
                            onClick={() => this.onLike(id, likes)}
                        >
                            thumb_up
                        </i>
                    </div>
                </li>
            );
        });
    }
    render() {
        return <ul className="collection">{this.renderLyrics()}</ul>;
    }
}

const mutation = gql`
    mutation LikeLyric($id: ID) {
        likeLyric(id: $id) {
            id
            likes
        }
    }
`;

export default graphql(mutation)(LyricList);

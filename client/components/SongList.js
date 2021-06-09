import React from "react";
import { graphql } from "react-apollo";
import { Link } from "react-router";
import fetchSongsQuery from "../queries/fetchSongs";

const SongList = ({ data: { songs, loading } }) => {
    const renderSongs = () => {
        return songs.map((song) => {
            return (
                <li key={song.id} className="collection-item">
                    {song.title}
                </li>
            );
        });
    };
    return (
        <div>
            <ul className="collection">
                {!loading ? renderSongs() : "Loading..."}
            </ul>
            <Link to="/songs/new" className="btn-floating btn-large red right">
                <i className="material-icons">add</i>
            </Link>
        </div>
    );
};

export default graphql(fetchSongsQuery)(SongList);

import React from 'react';

interface YoutubeEmbedProps {
    embedId: string;
}

// Fix: Implement the YoutubeEmbed component to resolve the module not found error.
const YoutubeEmbed: React.FC<YoutubeEmbedProps> = ({ embedId }) => {
    return (
        <div className="relative overflow-hidden w-full rounded-lg shadow-lg" style={{ paddingTop: '56.25%' }}>
            <iframe
                className="absolute top-0 left-0 w-full h-full"
                src={`https://www.youtube.com/embed/${embedId}`}
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                title="Embedded youtube"
            />
        </div>
    );
};

export default YoutubeEmbed;

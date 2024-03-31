import React, { useEffect, useState } from "react";
import Modal from "react-bootstrap/Modal";
import XIcon from "../img/twitter.png";
import FIcon from "../img/facebook.png";

const TopNews = ({ news }) => {
    const [ isNewsModalShow, setIsNewsModalShow ] = useState(false);
    const [ activeNews, setActiveNews ] = useState(false);
    useEffect(() => {
        
      }, [news]);

    const formatTime = (time) => {
        const timestamp = time * 1000;
        const date = new Date(timestamp);
        const options = { year: 'numeric', month: 'long', day: 'numeric' };
        return date.toLocaleDateString('en-US', options);
    };

    const handleNewsOnclick = (news) => {
        setActiveNews(news);
        setIsNewsModalShow(true);
    };

    const handleXOnClick = (title, url) => {
        const titleToShare = encodeURIComponent(title);
        const urlToShare = encodeURIComponent(url);
        const twitterShareUrl = `https://twitter.com/intent/tweet?text=${titleToShare}&url=${urlToShare}`;
        window.open(twitterShareUrl, '_blank');
    };

    const handleFOnClick = (url) => {
        const urlToShare = encodeURIComponent(url);
        const facebookShareUrl = `https://www.facebook.com/sharer/sharer.php?u=${urlToShare}`;
        window.open(facebookShareUrl, '_blank');
    };

    return (
        <div className="container-fluid row mt-3">
            <div className="col-0 col-sm-0 col-lg-2 "></div>
            <div className="col-12 col-sm-12 col-lg-10 container-fluid  d-flex justify-content-center m-0 p-0">
                <div className="row">
                {/* written by gpt begin */}
                {news.map((item, index) => (
                    <div onClick={() => handleNewsOnclick(item)} className={`col-12 col-sm-12 col-md-12 col-lg-5 bg-light border rounded container-fluid row mt-2 mx-1 news-card text-center m-0 p-0 ${news.length % 2 !== 0 && index === news.length - 1 ? 'last-odd-card' : ''}`} key={item.title}>
                        <img src={item.image} className="img-fluid col-12 col-sm-12 col-md-12 col-lg-3 news-image mt-2 ml-2" alt=""></img>
                        <div className="news-text-wrapper col-12 col-sm-12 col-md-12 col-lg-9 d-flex justify-content-center align-items-center m-0 p-0">
                            <p className="text-secondary text-center m-0 px-2">{item.title}</p>
                        </div>
                    </div>
                ))}
                {news.length % 2 !== 0 && <div className="col-lg-5 d-none d-lg-block"></div>}
                {/* written by gpt end */}
                </div>
            </div>
            {/* <div className="col-1"></div> */}
            <div className="row result-1-space"></div>
            <Modal show={isNewsModalShow} onHide={() => setIsNewsModalShow(false)} className="news-model-font">
                <Modal.Header closeButton className="news-model-header">
                    <Modal.Title>
                        <h1>{activeNews.source}</h1>
                        <p className="news-modal-date text-secondary my-0 py-0">{formatTime(activeNews.publishedDate)}</p>
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body className="px-4 my-0">
                    <h5>{activeNews.title}</h5>
                    <p>{activeNews.description}</p>
                    <p className="news-modal-link text-black-50 mb-0">For more details click <a href={activeNews.url} target="_blank">here</a></p>
                
                </Modal.Body>
                <Modal.Footer className="justify-content-start border rounded m-2 d-flex flex-column align-items-start mt-0">
                    {/* <div className="news-model-footer border rounded m-2"> */}
                    <p className="text-secondary">Share</p>
                    <div>
                        <img src={XIcon} alt="" className="share-icon mx-2" onClick={() => handleXOnClick(activeNews.title, activeNews.url)}/>
                        <img src={FIcon} alt="" className="share-icon mx-2" onClick={() => handleFOnClick(activeNews.url)}/>
                    </div>
                    
                    {/* </div> */}
                    
                
                </Modal.Footer>
            </Modal>
        </div>
        
        
    );
}


export default TopNews;
import React from 'react';
import PropTypes from 'prop-types';
import styles from './start-screen.css';

class StartScreen extends React.Component {
    constructor (props) {
        super(props);
        this.state = {
            recent: []
        };
    }
    componentDidMount () {
        if (typeof EditorPreload !== 'undefined' && EditorPreload.getRecentProjects) {
            EditorPreload.getRecentProjects().then(recent => {
                if (Array.isArray(recent)) {
                    this.setState({recent});
                }
            }).catch(() => {});
        }
    }
    handleNewProject () {
        if (typeof EditorPreload !== 'undefined' && EditorPreload.createNewProject) {
            EditorPreload.createNewProject();
        }
    }
    handleLoadFile () {
        if (typeof EditorPreload !== 'undefined' && EditorPreload.openProjectFromFile) {
            EditorPreload.openProjectFromFile();
        } else if (typeof EditorPreload !== 'undefined' && EditorPreload.showOpenFilePicker) {
            EditorPreload.showOpenFilePicker();
        }
    }
    handleFromScratch () {
        if (typeof EditorPreload !== 'undefined' && EditorPreload.openProjectFromScratch) {
            EditorPreload.openProjectFromScratch();
        }
    }
    handleOpenRecent (path) {
        if (typeof EditorPreload !== 'undefined' && EditorPreload.openRecentProject) {
            EditorPreload.openRecentProject(path).catch(() => {});
        }
    }
    render () {
        const {recent} = this.state;
        return (
            <div className={styles.startScreen}>
                <div className={styles.startHeader}>
                    <div className={styles.startLogo}>UliBlock</div>
                </div>
                <div className={styles.startContent}>
                    <div className={styles.startLeft}>
                        <button className={styles.startButton} onClick={this.handleNewProject.bind(this)}>
                            Новый проект
                        </button>
                        <button className={styles.startButton} onClick={this.handleLoadFile.bind(this)}>
                            Загрузить из файла
                        </button>
                        <button className={styles.startButton} onClick={this.handleFromScratch.bind(this)}>
                            Скачать со scratch
                        </button>
                    </div>
                    <div className={styles.startRight}>
                        <div className={styles.startSectionTitle}>Недавно открытые проекты</div>
                        <div className={styles.startList}>
                            {recent.length === 0 && (
                                <div className={styles.startEmpty}>Нет недавних проектов</div>
                            )}
                            {recent.map((item, index) => (
                                <div
                                    key={index}
                                    className={styles.startItem}
                                    onClick={this.handleOpenRecent.bind(this, item.path)}
                                >
                                    <div className={styles.startItemName}>{item.name || item.path}</div>
                                    <div className={styles.startItemPath}>{item.path}</div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}

StartScreen.propTypes = {};

export default StartScreen;

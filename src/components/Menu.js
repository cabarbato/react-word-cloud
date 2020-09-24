import React from 'react';
import { Row, Col, Dropdown } from 'react-bootstrap'

class Menu extends React.Component {
    onCategorySelectChange = (key) => {
        if (key !== this.props.category) {
            var category = key
            this.props.onChange(category)
        }
    }
    render() {
        return (
            <menu>
                <Row className="show-grid">
                    <Col md={12}>
                        <label htmlFor="category">Choose a category:</label>
                        <Dropdown onSelect={this.onCategorySelectChange}>
                            <Dropdown.Toggle variant="secondary" id="dropdown-basic">
                                {this.props.category}
                            </Dropdown.Toggle>
                            <Dropdown.Menu>
                                {this.props.categories.map((el, index) => {
                                    return <Dropdown.Item key={index} eventKey={el}>{el}</Dropdown.Item>
                                })}
                            </Dropdown.Menu>
                        </Dropdown>
                    </Col>
                </Row>
            </menu>
        )
    }
}

export default Menu;
import { Modal, Typography } from "antd"
import { Formik, Form , Field} from 'formik' // Import Formik form components
import * as Yup from 'yup' // import yup for validation
import NEW_API from "../../api/NewUrl"; // Import API base url

//import components
import EditableDate from "../EditableDate"
import EditableSelect from '../EditableSelect' // Import EditableSelect component
import SubmitWrapper from "../forms/SubmitWrapper"

const { Text } = Typography

//initial values
const initialValues = {
    name: "",
    city_id: "",
    type: "",
    status: "",
    goal: "",
    start_time: "",
    end_time: "",
}
//validation schema
const validationSchema = Yup.object({
    name: Yup.string().required("Required"),
    city_id: Yup.string().required("Required"),
    type: Yup.string().required("Required"),
    status: Yup.string().required("Required"),
    goal: Yup.string().required("Required"),
    start_time: Yup.string().required("Required"),
    end_time: Yup.string().required("Required"),
})



const CreateBounsModal = (props) => {




    return (
      <>
        <Formik
          initialValues={initialValues}
          validationSchema={validationSchema}
          onSubmit={(values) => {
            //send a post request to the server
            console.log(values);
           const response = NEW_API.post("/v1/bonuses", values);
            console.log(response);
          }}
        >
          <Modal
            title="Create New Bonus"
            open={props.open}
            onCancel={props.onCancel}
            // onOk={props.onOk}
            footer={[
              <SubmitWrapper key="submit" type="primary">
                Submit
              </SubmitWrapper>,
            ]}
          >
            <Form>
              <Field name="name" type="text" placeholder="Name" />
              <Field name="city_id" type="text" placeholder="City" />
              <Field name="type" type="text" placeholder="Type" />
              <Field name="status" type="text" placeholder="Status" />
              <Field name="goal" type="text" placeholder="Goal" />
              <Field name="start_time" type="text" placeholder="Start Date" />
              <Field name="end_time" type="text" placeholder="End Date" />
            </Form>
          </Modal>
        </Formik>
      </>
    );

}

export default CreateBounsModal
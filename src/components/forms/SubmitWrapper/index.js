import { Button } from "antd" // Import antd components
import { useFormikContext } from "formik" // Import Formik form hooks

const SubmitWrapper = ({ children, ...props }) => {
    const { submitForm, isSubmitting } = useFormikContext() // Destructure submitForm from useFormikContext

    const submitConfig = {
        ...props,
        onClick: () => submitForm(),
        disabled: isSubmitting,
    }

    return (
        <Button {...submitConfig}>
            {children}
        </Button>
    )
}

export default SubmitWrapper
import { FormEvent, useEffect, useState } from "react";
import { BusinessCard } from "../../store/cardStore";
import "./BusinessCardEditForm.css";

// BusinessCardEditForm 전용 필드 정의 (CardForm과 완전히 독립적)
const editFormFields: Array<{
  name: keyof BusinessCard;
  label: string;
  placeholder: string;
  required?: boolean;
  multiline?: boolean;
}> = [
  { name: "name", label: "이름", placeholder: "홍길동", required: true },
  { name: "position", label: "직함", placeholder: "Product Manager" },
  { name: "company", label: "회사", placeholder: "Cursor Studio" },
  { name: "phone", label: "전화", placeholder: "010-1234-5678" },
  { name: "email", label: "이메일", placeholder: "hello@cursor.ai" },
  {
    name: "memo",
    label: "메모",
    placeholder: "상대방의 취미나 관심사, 이벤트 등 메모하기",
    multiline: true,
  },
];

type BusinessCardEditFormProps = {
  initialValues?: Partial<BusinessCard>;
  onSubmit: (values: BusinessCard) => void;
  isSubmitting?: boolean;
};

const BusinessCardEditForm = ({
  initialValues,
  onSubmit,
  isSubmitting = false,
}: BusinessCardEditFormProps) => {
  const [formValues, setFormValues] = useState<Partial<BusinessCard>>(
    initialValues ?? {},
  );

  useEffect(() => {
    setFormValues(initialValues ?? {});
  }, [initialValues]);

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    if (!formValues.name) {
      alert("이름을 입력해주세요.");
      return;
    }
    onSubmit({
      id: formValues.id ?? crypto.randomUUID(),
      name: formValues.name,
      position: formValues.position,
      company: formValues.company,
      phone: formValues.phone,
      email: formValues.email,
      memo: formValues.memo,
      image: formValues.image,
      design: formValues.design,
    });
  };

  return (
    <div className="business-card-edit-form-container">
      <form className="business-card-edit-form" onSubmit={handleSubmit}>
        {editFormFields.map((field) => (
          <div key={field.name as string} className="business-card-edit-form-field">
            <label className="business-card-edit-form-label">
              {field.label}
              {field.required && (
                <span className="business-card-edit-form-label-required">*</span>
              )}
            </label>
            {field.multiline ? (
              <textarea
                value={formValues[field.name] ?? ""}
                onChange={(event) =>
                  setFormValues((prev) => ({
                    ...prev,
                    [field.name]: event.target.value,
                  }))
                }
                placeholder={field.placeholder}
                required={field.required}
                className="business-card-edit-form-textarea"
              />
            ) : (
              <input
                type="text"
                value={formValues[field.name] ?? ""}
                onChange={(event) =>
                  setFormValues((prev) => ({
                    ...prev,
                    [field.name]: event.target.value,
                  }))
                }
                placeholder={field.placeholder}
                required={field.required}
                className="business-card-edit-form-input"
              />
            )}
          </div>
        ))}
        <button
          type="submit"
          disabled={isSubmitting}
          className="business-card-edit-form-submit-button"
        >
          {isSubmitting ? "저장 중..." : "저장하기"}
        </button>
      </form>
    </div>
  );
};

export default BusinessCardEditForm;




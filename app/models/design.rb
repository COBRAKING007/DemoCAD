class Design < ApplicationRecord
  belongs_to :material
  has_one_attached :file

  validates :file, presence: true
  validates :material_id, uniqueness: { scope: :specifications, message: "and specifications combination already has a design" }
  
  validate :validate_specifications

  private

  def validate_specifications
    unless specifications.is_a?(Hash)
      errors.add(:specifications, "must be a valid set of options")
    end
  end
end

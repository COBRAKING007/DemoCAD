class Requirement < ApplicationRecord
  validates :name, presence: true

  def options_csv
    options.join(", ")
  end

  def options_csv=(values)
    self.options = values.split(",").map(&:strip).reject(&:blank?)
  end
end

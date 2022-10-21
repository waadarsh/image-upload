INSERT INTO chklst_composite_component_mapping(chklst_component_id,chklst_child_component_id) VALUES 
((SELECT MAX(chklst_component_id) FROM chklst_component),(SELECT composite_component_mapping_id FROM composite_component_mapping WHERE composite_component_id IN 
(SELECT component_id FROM component WHERE component_name = 'inputField1') AND child_component_id = 1))